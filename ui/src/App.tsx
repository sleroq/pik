import type { Component } from "solid-js";

import styles from "./App.module.css";
import Stickers from "./stickers";
import { createResource, createSignal, Show } from "solid-js";
import widgetApi from "./lib/connect-widget";
import Header from "./header/header";
import createToken from "./lib/auth";

const App: Component = () => {
  const [connectionFailed, setFailed] = createSignal<boolean>(false);
  const connectTimout = setTimeout(() => setFailed(true), 2000);
  const [authData] = createResource(createToken);

  // We can't rely on this event to show stickers only when widget is connected
  // Because at the moment, it does not work properly on android
  clearTimeout(connectTimout); // FIXME As soon as it's properly implemented on Android & IOS
  widgetApi.on("ready", function () {
    clearTimeout(connectTimout);
  });

  const getAuthData = () => {
    const data = authData();

    if (!data) throw new Error("auth data not prepared");

    return data;
  };

  return (
    <div class={styles.App}>
      <Show when={authData()} keyed>
        <Header authData={getAuthData()} />
        <Show when={connectionFailed()} keyed>
          <span>
            Seems like widget is not connected to the client. Try restarting the
            widget.
          </span>
        </Show>
        <Stickers authData={getAuthData()} />
      </Show>
    </div>
  );
};

export default App;
