import * as THREE from 'three'
import Core from './Core.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Lens
{
    constructor()
    {
        this.core = new Core()
        this.profile = this.core.profile
        this.workbench = this.core.workbench
        this.clock = this.core.clock
        this.metrics = this.core.metrics
        this.targetElement = this.core.targetElement
        this.stage = this.core.stage

        this.mode = 'debug'

        this.setInstance()
        this.setModes()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(35, this.profile.width / this.profile.height, 0.1, 150)
        this.instance.rotation.reorder('YXZ')
        this.stage.add(this.instance)
    }

    setModes()
    {
        this.modes = {}

        this.modes.default = {}
        this.modes.default.instance = this.instance.clone()
        this.modes.default.instance.rotation.reorder('YXZ')

        this.modes.debug = {}
        this.modes.debug.instance = this.instance.clone()
        this.modes.debug.instance.rotation.reorder('YXZ')
        this.modes.debug.instance.position.set(5, 5, 5)
        
        this.modes.debug.orbitControls = new OrbitControls(this.modes.debug.instance, this.targetElement)
        this.modes.debug.orbitControls.enabled = this.modes.debug.active
        this.modes.debug.orbitControls.screenSpacePanning = true
        this.modes.debug.orbitControls.enableKeys = false
        this.modes.debug.orbitControls.zoomSpeed = 0.25
        this.modes.debug.orbitControls.enableDamping = true
        this.modes.debug.orbitControls.update()
    }

    resize()
    {
        this.instance.aspect = this.profile.width / this.profile.height
        this.instance.updateProjectionMatrix()

        this.modes.default.instance.aspect = this.profile.width / this.profile.height
        this.modes.default.instance.updateProjectionMatrix()

        this.modes.debug.instance.aspect = this.profile.width / this.profile.height
        this.modes.debug.instance.updateProjectionMatrix()
    }

    update()
    {
        this.modes.debug.orbitControls.update()
        this.instance.position.copy(this.modes[this.mode].instance.position)
        this.instance.quaternion.copy(this.modes[this.mode].instance.quaternion)
        this.instance.updateMatrixWorld()
    }

    animateZoomIn()
    {
        const startFOV = 35
        const targetFOV = 10
        const duration = 600
        const startTime = Date.now()

        const animate = () =>
        {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeProgress = 1 - Math.pow(1 - progress, 3)
            
            this.instance.fov = startFOV + (targetFOV - startFOV) * easeProgress
            this.instance.updateProjectionMatrix()

            if(progress < 1)
            {
                requestAnimationFrame(animate)
            }
        }

        animate()
    }

    destroy()
    {
        this.modes.debug.orbitControls.destroy()
    }
}
