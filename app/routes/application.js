import Route from '@ember/routing/route';
import { WidgetApi, MatrixCapabilities } from 'matrix-widget-api';

export default class ApplicationRoute extends Route {
    api = undefined

    constructor(props){
        super(props)

        console.log('started widget thing')
        const api = new WidgetApi()
        api.requestCapability(MatrixCapabilities.StickerSending)
 
        api.on('ready', async function () {
          console.log('widget is ready')
        })
 
        api.start()
 
        this.api = api
    }
}
