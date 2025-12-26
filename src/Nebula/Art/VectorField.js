import * as THREE from 'three'

import Core from '../Core.js'
import vertexShader from '../shaders/currents/flow.vert'
import fragmentShader from '../shaders/currents/flow.frag'

export default class VectorField
{
    constructor(_options)
    {
        this.core = new Core()
        this.painter = this.core.painter
        this.clock = this.core.clock
        this.stage = this.core.stage

        this.particlePositions = _options.positions
        this.debugPanel = _options.debugFolder
        this.mousePointer = _options.mouse || new THREE.Vector2(999, 999)
        
        this.particleCount = this.particlePositions.length / 3
        this.textureResolutionWidth = 640
        this.textureResolutionHeight = 427
        this.flowFieldTexture = null
        this.randomSeed = Math.random() * 1000

        if(this.debugPanel)
        {
            this.debugFolder = this.debugPanel.addFolder({ title: 'currents' })
        }

        this.initializeBaseTexture()
        this.initializeRenderTargets()
        this.setupEnvironment()
        this.createFlowFieldPlane()
        this.createDebugVisualization()
        this.setupTextureUVMapping()

        this.renderFlowField()
    }

    initializeBaseTexture()
    {
        const pixelCount = this.textureResolutionWidth * this.textureResolutionHeight
        const textureData = new Float32Array(pixelCount * 4)

        for(let i = 0; i < pixelCount; i++)
        {
            textureData[i * 4 + 0] = this.particlePositions[i * 3 + 0]
            textureData[i * 4 + 1] = this.particlePositions[i * 3 + 1]
            textureData[i * 4 + 2] = this.particlePositions[i * 3 + 2]
            textureData[i * 4 + 3] = Math.random()
        }

        this.baseTexture = new THREE.DataTexture(
            textureData,
            this.textureResolutionWidth,
            this.textureResolutionHeight,
            THREE.RGBAFormat,
            THREE.FloatType
        )
        this.baseTexture.minFilter = THREE.NearestFilter
        this.baseTexture.magFilter = THREE.NearestFilter
        this.baseTexture.generateMipmaps = false
    }

    initializeRenderTargets()
    {
        this.renderTargets = {}
        this.renderTargets.a = new THREE.WebGLRenderTarget(
            this.textureResolutionWidth,
            this.textureResolutionHeight,
            {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                generateMipmaps: false,
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
                encoding: THREE.LinearEncoding,
                depthBuffer: false,
                stencilBuffer: false
            }
        )
        this.renderTargets.b = this.renderTargets.a.clone()
        this.renderTargets.primary = this.renderTargets.a
        this.renderTargets.secondary = this.renderTargets.b
    }

    setupEnvironment()
    {
        this.environment = {}
        this.environment.scene = new THREE.Scene()
        this.environment.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
        this.environment.camera.position.z = 1
    }

    createFlowFieldPlane()
    {
        this.plane = {}
        this.plane.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
        this.plane.material = new THREE.ShaderMaterial({
            uniforms:
            {
                uTime: { value: 0 },
                uDelta: { value: 16 },

                uBaseTexture: { value: this.baseTexture },
                uTexture: { value: this.baseTexture },

                uDecaySpeed: { value: 0.00049 },

                uMouse: { value: new THREE.Vector2() },
                uMouseRadius: { value: 0.15 },
                uMouseStrength: { value: 0.28 },
                uMouseStepLimit: { value: 0.0025 },

                uPerlinFrequency: { value: 4 },
                uPerlinMultiplier: { value: 0.004 },
                uTimeFrequency: { value: 0.0004 },
                uSeed: { value: this.randomSeed }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        })

        this.plane.mesh = new THREE.Mesh(this.plane.geometry, this.plane.material)
        this.environment.scene.add(this.plane.mesh)
        
        if(this.debugPanel)
        {
            this.debugFolder.addInput(this.plane.material.uniforms.uDecaySpeed, 'value', { label: 'uDecaySpeed', min: 0, max: 0.005, step: 0.00001 })
            this.debugFolder.addInput(this.plane.material.uniforms.uMouseRadius, 'value', { label: 'uMouseRadius', min: 0.01, max: 1, step: 0.01 })
            this.debugFolder.addInput(this.plane.material.uniforms.uMouseStrength, 'value', { label: 'uMouseStrength', min: 0, max: 2, step: 0.01 })
            this.debugFolder.addInput(this.plane.material.uniforms.uMouseStepLimit, 'value', { label: 'uMouseStepLimit', min: 0.0001, max: 0.01, step: 0.0001 })
            this.debugFolder.addInput(this.plane.material.uniforms.uPerlinFrequency, 'value', { label: 'uPerlinFrequency', min: 0, max: 5, step: 0.001 })
            this.debugFolder.addInput(this.plane.material.uniforms.uPerlinMultiplier, 'value', { label: 'uPerlinMultiplier', min: 0, max: 0.1, step: 0.001 })
            this.debugFolder.addInput(this.plane.material.uniforms.uTimeFrequency, 'value', { label: 'uTimeFrequency', min: 0, max: 0.005, step: 0.0001 })
        }
    }

    createDebugVisualization()
    {
        this.debugPlane = {}
        this.debugPlane.geometry = new THREE.PlaneGeometry(1, this.textureResolutionHeight / this.textureResolutionWidth, 1, 1)
        this.debugPlane.material = new THREE.MeshBasicMaterial({ transparent: true })
        this.debugPlane.mesh = new THREE.Mesh(this.debugPlane.geometry, this.debugPlane.material)
        this.debugPlane.mesh.visible = false
        this.stage.add(this.debugPlane.mesh)
        
        if(this.debugPanel)
        {
            this.debugFolder.addInput(this.debugPlane.mesh, 'visible', { label: 'debugPlaneVisible' })
        }
    }

    setupTextureUVMapping()
    {
        this.fboUv = {}
        this.fboUv.data = new Float32Array(this.particleCount * 2)

        const halfExtentX = 1 / this.textureResolutionWidth / 2
        const halfExtentY = 1 / this.textureResolutionHeight / 2

        for(let i = 0; i < this.particleCount; i++)
        {
            const x = (i % this.textureResolutionWidth) / this.textureResolutionWidth + halfExtentX
            const y = Math.floor(i / this.textureResolutionWidth) / this.textureResolutionHeight + halfExtentY
            this.fboUv.data[i * 2 + 0] = x
            this.fboUv.data[i * 2 + 1] = y
        }

        this.fboUv.attribute = new THREE.BufferAttribute(this.fboUv.data, 2)
    }

    renderFlowField()
    {
        this.painter.instance.setRenderTarget(this.renderTargets.primary)
        this.painter.instance.render(this.environment.scene, this.environment.camera)
        this.painter.instance.setRenderTarget(null)

        const temp = this.renderTargets.primary
        this.renderTargets.primary = this.renderTargets.secondary
        this.renderTargets.secondary = temp
        
        this.flowFieldTexture = this.renderTargets.secondary.texture
        this.debugPlane.material.map = this.flowFieldTexture
    }

    update()
    {
        this.plane.material.uniforms.uDelta.value = this.clock.delta
        this.plane.material.uniforms.uTime.value = this.clock.elapsed
        this.plane.material.uniforms.uTexture.value = this.renderTargets.secondary.texture
        this.plane.material.uniforms.uMouse.value.copy(this.mousePointer)
        this.renderFlowField()
    }

    dispose()
    {
        this.baseTexture.dispose()
        this.renderTargets.a.dispose()
        this.renderTargets.b.dispose()
        this.plane.geometry.dispose()
        this.plane.material.dispose()

        this.debugPlane.geometry.dispose()
        this.stage.remove(this.debugPlane.mesh)

        if(this.debugPanel)
        {
            this.debugFolder.dispose()
        }
    }

    get texture()
    {
        return this.flowFieldTexture
    }
}
