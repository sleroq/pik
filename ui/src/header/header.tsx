import { Component, createSignal, Show } from "solid-js";
import styles from "./header.module.css";
import { AuthData } from "../lib/auth";
import { USERID } from "../lib/connect-widget";
import PikApi from "../lib/pik-api";

const Header: Component<{ authData: AuthData }> = (props: {
  authData: AuthData;
}) => {
  const { authData } = props;
  const [showToken, setShowToken] = createSignal<boolean>(true);
  const [popup, setPopup] = createSignal<boolean>(false);
  const pik = new PikApi(import.meta.env.VITE_API_URL, authData.apiToken);
  const msg = `!pik auth ${authData.token}`;

  const checkAuth = async () => {
    if (await pik.checkAuth(USERID)) setShowToken(false);
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setPopup(true);
    setTimeout(() => setPopup(false), 1000);
    setTimeout(() => checkAuth(), 20000);
  };

  void checkAuth();

  return (
    <div class={styles.header}>
      <Show
        when={USERID === "@unknown:sleroq.link" && window.self !== window.top}
        keyed
      >
        userId is not set!
      </Show>
      <Show when={showToken()} keyed>
        <span>
          Auth: <code onClick={() => copyText(msg)}>{msg}</code>
        </span>
      </Show>
      <Show when={popup()} keyed>
        <div class={styles.popup}>copied!</div>
      </Show>
    </div>
  );
};

export default Header;
