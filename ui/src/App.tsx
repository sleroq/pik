import type { Component } from "solid-js";

import styles from "./App.module.css";
import Stickers from "./stickers";
import { createSignal, Show } from "solid-js";
import widgetApi from "./connect-widget";

const Loading: Component = () => {
  return <div class="loading">Connecting</div>;
};

const App: Component = () => {
  const [connectionFailed, setFailed] = createSignal<boolean>(false);
  const connectTimout = setTimeout(() => setFailed(true), 2000);

  // We can't rely on this event to show stickers only when widget is connected
  // Because at the moment, it does not work properly on android
  clearTimeout(connectTimout); // FIXME As soon as it's properly implemented on Android & IOS
  widgetApi.on("ready", function () {
    clearTimeout(connectTimout);
  });

  return (
    <div class={styles.App}>
      <Show when={connectionFailed()} keyed>
        <span>
          Seems like widget is not connected to the client. Try restarting the
          widget.
        </span>
      </Show>
      <Stickers />
    </div>
  );
};

export default App;
