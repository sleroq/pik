import { Component, createSignal, Show } from "solid-js";
import styles from "./header.module.css";
import { useToken } from "../lib/token";

const Header: Component = () => {
  const [popup, setPopup] = createSignal<boolean>(false);
  const token = useToken();
  const msg = `!pik auth ${token}`;

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setPopup(true);
    setTimeout(() => setPopup(false), 1000);
  };

  return (
    <div>
      <span>
        Auth: <code onclick={() => copyText(msg)}>{msg}</code>
      </span>
      <Show when={popup()} keyed>
        <div class={styles.popup}>copied!</div>
      </Show>
    </div>
  );
};

export default Header;
