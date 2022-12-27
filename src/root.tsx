import {
  component$,
  useStyles$,
  createContext,
  useStore,
  useClientEffect$,
  useContextProvider,
  noSerialize,
  NoSerialize,
} from '@builder.io/qwik'
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from '@builder.io/qwik-city'
import { RouterHead } from './components/router-head/router-head'
import { WidgetApi, MatrixCapabilities } from 'matrix-widget-api'

import globalStyles from './global.css?inline'

export interface SharedState {
  api?: NoSerialize<WidgetApi>
  isReady: 'yes' | 'not yet' | 'failed'
}
export const MyContext = createContext<SharedState>('everything')

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */
  useStyles$(globalStyles)

  const state = useStore<SharedState>({ isReady: 'not yet' })

  useClientEffect$(() => {
    console.log('useClientEffect$')
    const api = new WidgetApi()
    api.requestCapability(MatrixCapabilities.StickerSending)

    const timout = setTimeout(() => (state.isReady = 'failed'), 5000)

    api.on('ready', async function () {
      console.log('widget is ready')
      state.isReady = 'yes'
      clearTimeout(timout)
    })

    api.start()

    // TODO: Is there a better way?
    state.api = noSerialize(api)
  })

  useContextProvider(MyContext, state)

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
        {/* Slowing down page loading for api to load before client post message */}
        <img
          src={`https://delay.sleroq.link/${Math.floor(
            Math.random() * (2000 - 500) + 500 // Random timeout to prevent caching
          )}/static.sleroq.link/funny-cat.jpg`}
          style="display: none"
        ></img>
      </body>
    </QwikCityProvider>
  )
})
