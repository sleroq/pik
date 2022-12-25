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

  const state = useStore<SharedState>({})

  useClientEffect$(() => {
    const api = new WidgetApi()
    api.requestCapability(MatrixCapabilities.StickerSending)

    api.on('ready', async function () {
      console.log('widget is ready')
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
      </body>
    </QwikCityProvider>
  )
})
