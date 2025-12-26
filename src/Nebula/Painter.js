import * as THREE from 'three'
import Core from './Core.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'

export default class Painter
{
    constructor(_options = {})
    {
        this.core = new Core()
        this.profile = this.core.profile
        this.workbench = this.core.workbench
        this.monitor = this.core.monitor
        this.clock = this.core.clock
        this.metrics = this.core.metrics
        this.stage = this.core.stage
        this.lens = this.core.lens
        
        this.usePostprocess = false

        this.setInstance()
        this.setPostProcess()
    }

    setInstance()
    {
        this.clearColor = '#eeeeee'

        this.instance = new THREE.WebGLRenderer({
            alpha: false,
            antialias: true
        })
        this.instance.domElement.style.position = 'absolute'
        this.instance.domElement.style.top = 0
        this.instance.domElement.style.left = 0
        this.instance.domElement.style.width = '100%'
        this.instance.domElement.style.height = '100%'

        this.instance.setClearColor(this.clearColor, 1)
        this.instance.setSize(this.profile.width, this.profile.height)
        this.instance.setPixelRatio(this.profile.pixelRatio)

        this.context = this.instance.getContext()

        if(this.monitor)
        {
            this.monitor.setRenderPanel(this.context)
        }
    }

    setPostProcess()
    {
        this.postProcess = {}
        this.postProcess.renderPass = new RenderPass(this.stage, this.lens.instance)

        const RenderTargetClass = this.profile.pixelRatio >= 2 ? THREE.WebGLRenderTarget : THREE.WebGLMultisampleRenderTarget
        this.renderTarget = new RenderTargetClass(
            this.profile.width,
            this.profile.height,
            {
                generateMipmaps: false,
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBFormat,
                encoding: THREE.sRGBEncoding
            }
        )
        this.postProcess.composer = new EffectComposer(this.instance, this.renderTarget)
        this.postProcess.composer.setSize(this.profile.width, this.profile.height)
        this.postProcess.composer.setPixelRatio(this.profile.pixelRatio)
        this.postProcess.composer.addPass(this.postProcess.renderPass)
    }

    resize()
    {
        this.instance.setSize(this.profile.width, this.profile.height)
        this.instance.setPixelRatio(this.profile.pixelRatio)

        this.postProcess.composer.setSize(this.profile.width, this.profile.height)
        this.postProcess.composer.setPixelRatio(this.profile.pixelRatio)
    }

    update()
    {
        if(this.monitor)
        {
            this.monitor.beforeRender()
        }

        if(this.usePostprocess)
        {
            this.postProcess.composer.render()
        }
        else
        {
            this.instance.render(this.stage, this.lens.instance)
        }

        if(this.monitor)
        {
            this.monitor.afterRender()
        }
    }

    destroy()
    {
        this.instance.renderLists.dispose()
        this.instance.dispose()
        this.renderTarget.dispose()
        this.postProcess.composer.renderTarget1.dispose()
        this.postProcess.composer.renderTarget2.dispose()
    }
}
