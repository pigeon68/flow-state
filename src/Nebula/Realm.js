import Core from './Core.js'
import Mosaic from './Art/Mosaic.js'

export default class Realm
{
    constructor()
    {
        this.core = new Core()
        this.profile = this.core.profile
        this.stage = this.core.stage
        this.depot = this.core.depot
        
        this.depot.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.setArtwork()
            }
        })
    }

    setArtwork()
    {
        this.artwork = new Mosaic()
    }

    resize() {}

    update()
    {
        if(this.artwork)
            this.artwork.update()
    }

    destroy() {}
}
