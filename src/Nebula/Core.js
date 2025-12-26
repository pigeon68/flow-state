import * as THREE from 'three'
import { Pane } from 'tweakpane'

import Clock from './fundamentals/Clock.js'
import Metrics from './fundamentals/Metrics.js'
import Monitor from './fundamentals/Monitor.js'

import Depot from './Depot.js'
import Painter from './Painter.js'
import Lens from './Lens.js'
import Realm from './Realm.js'

import catalogue from './Catalogue.js'

export default class Core
{
    static instance

    constructor(_options = {})
    {
        if(Core.instance)
        {
            return Core.instance
        }
        Core.instance = this

        this.targetElement = _options.targetElement
        if(!this.targetElement)
        {
            console.warn('Missing targetElement')
            return
        }

        this.clock = new Clock()
        this.metrics = new Metrics()
        this.setProfile()
        this.setMonitor()
        this.setWorkbench()
        this.setStage()
        this.setLens()
        this.setPainter()
        this.setDepot()
        this.setRealm()
        
        this.metrics.on('resize', () =>
        {
            this.resize()
        })

        this.update()
    }

    setProfile()
    {
        this.profile = {}
        this.profile.debug = window.location.hash === '#debug'
        this.profile.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        const boundings = this.targetElement.getBoundingClientRect()
        this.profile.width = boundings.width
        this.profile.height = boundings.height || window.innerHeight
    }

    setMonitor()
    {
        if(this.profile.debug)
        {
            this.monitor = new Monitor(true)
        }
    }

    setWorkbench()
    {
        if(this.profile.debug)
        {
            this.workbench = new Pane()
            this.workbench.containerElem_.style.width = '320px'
        }
    }
    
    setStage()
    {
        this.stage = new THREE.Scene()
    }

    setLens()
    {
        this.lens = new Lens()
    }

    setPainter()
    {
        this.painter = new Painter({ rendererInstance: this.rendererInstance })
        this.targetElement.appendChild(this.painter.instance.domElement)
    }

    setDepot()
    {
        this.depot = new Depot(catalogue)
    }

    setRealm()
    {
        this.realm = new Realm()
    }

    update()
    {
        if(this.monitor)
            this.monitor.update()
        
        this.lens.update()
        if(this.realm)
            this.realm.update()
        if(this.painter)
            this.painter.update()

        window.requestAnimationFrame(() =>
        {
            this.update()
        })
    }

    resize()
    {
        const boundings = this.targetElement.getBoundingClientRect()
        this.profile.width = boundings.width
        this.profile.height = boundings.height
        this.profile.pixelRatio = Math.min(Math.max(window.devicePixelRatio, 1), 2)

        if(this.lens)
            this.lens.resize()
        if(this.painter)
            this.painter.resize()
        if(this.realm)
            this.realm.resize()
    }

    destroy() {}
}
