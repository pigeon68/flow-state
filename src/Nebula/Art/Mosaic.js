import * as THREE from 'three'

import Core from '../Core.js'
import VectorField from './VectorField.js'
import spritesVertex from '../shaders/sprites/points.vert'
import spritesFragment from '../shaders/sprites/points.frag'

export default class Mosaic
{
    constructor()
    {
        this.core = new Core()
        this.profile = this.core.profile
        this.loadedAssets = this.core.depot
        this.stage = this.core.stage
        this.workbench = this.core.workbench

        this.maxDimension = 800
        this.sourceImage = this.loadedAssets.items.inputTexture
        this.texture = this.sourceImage

        this.applyTexture(this.texture)
        this.initializeMouseTracking()

        if(this.workbench)
        {
            this.debugFolder = this.workbench.addFolder({ title: 'sprites' })
        }
    }

    resetParticles()
    {
        this.applyTexture(this.texture || this.sourceImage)
    }

    generateParticlePositions()
    {
        this.particlePositions = new Float32Array(this.particleCount * 3)

        for(let row = 0; row < this.imageHeight; row++)
        {
            for(let col = 0; col < this.imageWidth; col++)
            {
                const index = row * this.imageWidth + col
                this.particlePositions[index * 3 + 0] = (col / this.imageWidth - 0.5) * this.aspectRatio
                this.particlePositions[index * 3 + 1] = row / this.imageHeight - 0.5
                this.particlePositions[index * 3 + 2] = 0
            }
        }
    }

    initializeFlux()
    {
        this.fluxMap = new VectorField({ 
            positions: this.particlePositions, 
            debugFolder: this.debugFolder, 
            mouse: this.cursor 
        })
    }

    buildBufferGeometry()
    {
        const particleSizes = new Float32Array(this.particleCount)
        const textureCoordinates = new Float32Array(this.particleCount * 2)

        for(let i = 0; i < this.particleCount; i++)
        {
            particleSizes[i] = 0.2 + Math.random() * 0.8
        }
        
        for(let row = 0; row < this.imageHeight; row++)
        {
            for(let col = 0; col < this.imageWidth; col++)
            {
                const index = row * this.imageWidth + col
                textureCoordinates[index * 2 + 0] = col / this.imageWidth
                textureCoordinates[index * 2 + 1] = row / this.imageHeight
            }
        }

        this.geometry = new THREE.BufferGeometry()
        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3))
        this.geometry.setAttribute('aSize', new THREE.BufferAttribute(particleSizes, 1))
        this.geometry.setAttribute('aFboUv', this.fluxMap.fboUv.attribute)
        this.geometry.setAttribute('aUv', new THREE.BufferAttribute(textureCoordinates, 2))
    }

    createShaderMaterial()
    {
        this.particleMaterial = new THREE.ShaderMaterial({
            uniforms:
            {
                uSize: { value: 50 * this.profile.pixelRatio },
                uTexture: { value: this.texture },
                uFBOTexture: { value: this.fluxMap.texture }
            },
            vertexShader: spritesVertex,
            fragmentShader: spritesFragment
        })
        
        if(this.workbench)
        {
            this.debugFolder
                .addInput(
                    this.particleMaterial.uniforms.uSize,
                    'value',
                    { label: 'uSize', min: 1, max: 100, step: 1 }
                )
        }
    }

    attachGeometryToStage()
    {
        this.particleSystem = new THREE.Points(this.geometry, this.particleMaterial)
        this.stage.add(this.particleSystem)
    }

    update()
    {
        this.fluxMap.update()
        this.particleMaterial.uniforms.uFBOTexture.value = this.fluxMap.texture
    }

    applyTexture(texture)
    {
        if(!texture || !texture.image)
        {
            return
        }

        this.texture = texture

        const sourceWidth = texture.image.width || 640
        const sourceHeight = texture.image.height || 427

        const scaleFactor = Math.min(1, this.maxDimension / Math.max(sourceWidth, sourceHeight))
        this.imageWidth = Math.max(1, Math.floor(sourceWidth * scaleFactor))
        this.imageHeight = Math.max(1, Math.floor(sourceHeight * scaleFactor))

        this.aspectRatio = this.imageWidth / this.imageHeight
        this.particleCount = this.imageWidth * this.imageHeight

        if(this.fluxMap)
            this.fluxMap.dispose()

        if(this.geometry)
            this.geometry.dispose()

        this.generateParticlePositions()
        this.initializeFlux()
        this.buildBufferGeometry()

        if(!this.particleMaterial)
        {
            this.createShaderMaterial()
        }

        this.particleMaterial.uniforms.uTexture.value = this.texture
        this.particleMaterial.uniforms.uFBOTexture.value = this.fluxMap.texture

        if(!this.particleSystem)
        {
            this.attachGeometryToStage()
        }
        else
        {
            this.particleSystem.geometry = this.geometry
        }

        if(this.core.lens)
        {
            this.core.lens.animateZoomIn()
        }
    }

    loadUserUploadedImage(file)
    {
        if(!file) return

        const reader = new FileReader()

        reader.onload = () =>
        {
            const image = new Image()
            image.onload = () =>
            {
                const texture = new THREE.Texture(image)
                texture.needsUpdate = true
                this.applyTexture(texture)
            }
            image.src = reader.result
        }

        reader.readAsDataURL(file)
    }

    initializeMouseTracking()
    {
        this.cursor = new THREE.Vector2(999, 999)

        const updateMouse = (event) =>
        {
            const bounds = this.core.targetElement.getBoundingClientRect()
            const x = (event.clientX - bounds.left) / bounds.width
            const y = (event.clientY - bounds.top) / bounds.height

            this.cursor.set(
                (x - 0.5) * this.aspectRatio,
                -(y - 0.5)
            )
        }

        const resetMouse = () =>
        {
            this.cursor.set(999, 999)
        }

        window.addEventListener('pointermove', updateMouse)
        window.addEventListener('pointerleave', resetMouse)
    }
}
