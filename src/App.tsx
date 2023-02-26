import type { Component } from "solid-js";

import styles from "./App.module.css";
import Stickers from "./stickers";
import { createSignal, Match, Switch } from "solid-js";
import { widgetApi } from "./connect-widget";

const Loading: Component = () => {
  return <div class="loading">Connecting</div>;
};

const App: Component = () => {
  const [widgetIsReady, setReady] = createSignal("not yet");
  const connectTimout = setTimeout(() => setReady("failed"), 2000);

  widgetApi.on("ready", function () {
    setReady("yes");
    clearTimeout(connectTimout);
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>Pik sticker picker</header>
      <Switch
        fallback={
          "Failed to connect to matrix client. Try to restart the widget."
        }
      >
        <Match when={widgetIsReady() === "yes"}>
          <Stickers />
        </Match>
        <Match when={widgetIsReady() === "not yet"}>
          <Loading />
        </Match>
      </Switch>
      {widgetIsReady() === "yes" ?? <Stickers />}
    </div>
  );
};

export default App;
