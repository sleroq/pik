import { component$, useStyles$, createContext, useStore, useClientEffect$, useContextProvider, noSerialize, NoSerialize } from '@builder.io/qwik'
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from '@builder.io/qwik-city'
import { RouterHead } from './components/router-head/router-head'
import { WidgetApi, MatrixCapabilities } from 'matrix-widget-api'

import globalStyles from './global.css?inline'

export interface SharedState {
  api?: NoSerialize<WidgetApi>;
}
export const MyContext = createContext<SharedState>('everything');

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */
  useStyles$(globalStyles)

  const state = useStore<SharedState>({});

  useClientEffect$(() => {
    // TODO: Figure out how to get this
    const widgetId = '!kzgAp0oSUS85E6NS%3Asleroq.link_%40sleroq%3Asleroq.link_1671992491687'
    console.log('widget id: ', widgetId)

    // TODO: Figure out how to get this
    const api = new WidgetApi(widgetId, 'https://develop.element.io')
    api.requestCapability(MatrixCapabilities.StickerSending)

    api.on('ready', async function () {
      console.log('widget is ready')
    })

    api.start()

    // TODO: Is there a better way?
    state.api = noSerialize(api)
  })

  useContextProvider(MyContext, state);

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <meta
          http-equiv="Content-Security-Policy"
          content="frame-ancestors https://*;"
        />
        <link rel="manifest" href="/manifest.json" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  )
})