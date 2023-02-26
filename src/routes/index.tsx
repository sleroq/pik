import { component$, useContext, useStore, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { MyContext } from "~/root";
import StickerPacks from "~/components/sticker-packs/sticker-packs";

interface LoadingProps {
  text: string;
}
export const Loading = component$<LoadingProps>(({ text }) => {
  return <div>{text}</div>;
});

export default component$(() => {
  const state = useContext(MyContext);
  const store = useStore({ loading: "Connecting..." });

  useTask$(({ track }) => {
    track(state);
    switch (state.isReady) {
      case "not yet":
        store.loading = "Connecting...";
        break;
      case "failed":
        store.loading =
          "Failed to connect to the client\nTry to reopen the widget";
        break;
    }
  });

  return (
    <div>
      <h1>
        Welcome to Pik <span class="lightning">⚡️</span>
      </h1>

      {state.isReady === "yes" ? (
        <StickerPacks />
      ) : (
        <Loading text={store.loading} />
      )}

      <Link class="todolist" href="/todolist/">
        TODO demo 📝
      </Link>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Pik",
  meta: [
    {
      name: "description",
      content: "Matrix sticker picker",
    },
  ],
};
