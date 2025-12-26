import * as THREE from 'three'
import Bus from './fundamentals/Bus.js'
import Fetcher from './fundamentals/Fetcher.js'

export default class Depot extends Bus
{
    constructor(_assets)
    {
        super()

        this.items = {}
        this.loader = new Fetcher({ renderer: this.renderer })

        this.groups = {}
        this.groups.assets = [..._assets]
        this.groups.loaded = []
        this.groups.current = null
        this.loadNextGroup()

        this.loader.on('fileEnd', (_resource, _data) =>
        {
            let data = _data
            if(_resource.type === 'texture')
            {
                if(!(data instanceof THREE.Texture))
                {
                    data = new THREE.Texture(_data)
                }
                data.needsUpdate = true
            }

            this.items[_resource.name] = data
            this.groups.current.loaded++
            this.trigger('progress', [this.groups.current, _resource, data])
        })

        this.loader.on('end', () =>
        {
            this.groups.loaded.push(this.groups.current)
            this.trigger('groupEnd', [this.groups.current])

            if(this.groups.assets.length > 0)
            {
                this.loadNextGroup()
            }
            else
            {
                this.trigger('end')
            }
        })
    }

    loadNextGroup()
    {
        this.groups.current = this.groups.assets.shift()
        this.groups.current.toLoad = this.groups.current.items.length
        this.groups.current.loaded = 0
        this.loader.load(this.groups.current.items)
    }

    destroy()
    {
        for(const _itemKey in this.items)
        {
            const item = this.items[_itemKey]
            if(item instanceof THREE.Texture)
            {
                item.dispose()
            }
        }
    }
}
