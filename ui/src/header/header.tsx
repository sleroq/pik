import { Component, createSignal, Show } from "solid-js";
import styles from "./header.module.css";
import { useToken } from "../lib/token";
import { USERID } from "../connect-widget";
import {root} from "solid-js/web/types/core";

const getAuth = async (userId: string, token: string) => {
  const res = await (
    await fetch(
      new URL(`/api/auth?userId=${userId}&token=${token}`, env.API_URL)
    )
  ).json();

  return res?.data?.auth === true;
};

const Header: Component = () => {
  const [showToken, setShowToken] = createSignal<boolean>(true);
  const [popup, setPopup] = createSignal<boolean>(false);
  const token = useToken();
  const msg = `!pik auth ${token}`;

  const checkAuth = async (userId: string, token: string) => {
    if (await getAuth(userId, token)) setShowToken(false);
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setPopup(true);
    setTimeout(() => setPopup(false), 1000);
    setTimeout(() => checkAuth(USERID, token), 20000);
  };

  void checkAuth(USERID, token)

  return (
    <div>
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
