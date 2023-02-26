import type { NoSerialize } from "@builder.io/qwik";
import {
  component$,
  createContextId,
  noSerialize,
  useBrowserVisibleTask$,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";
import { MatrixCapabilities, WidgetApi } from "matrix-widget-api";

export interface SharedState {
  api?: NoSerialize<WidgetApi>;
  isReady: "yes" | "not yet" | "failed";
}
export const MyContext = createContextId<SharedState>("sharedState");

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Dont remove the `<head>` and `<body>` elements.
   */

  const state = useStore<SharedState>({ isReady: "not yet" });

  useBrowserVisibleTask$(() => {
    const api = new WidgetApi();
    api.requestCapability(MatrixCapabilities.StickerSending);

    const timout = setTimeout(() => (state.isReady = "failed"), 1000);

    api.on("ready", async function () {
      console.log("widget is ready");
      state.isReady = "yes";
      clearTimeout(timout);
    });

    api.start();

    // TODO: Is there a better way?
    state.api = noSerialize(api);
  });

  useContextProvider(MyContext, state);

  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <script src="https://unpkg.com/matrix-widget-api@1.1.1/dist/api.min.js"></script>
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
