import type { Component } from "solid-js";
import { createEffect, createSignal, For, Show } from "solid-js";

import styles from "./stickers.module.css";
import widgetApi, { USERID } from "./lib/connect-widget";
import Cookie from "./lib/cookie";
import PikApi, {
  makeSticker,
  ServerSticker,
  ServerStickerPack,
} from "./lib/pik-api";
import { AuthData } from "./lib/auth";
import { usePacks } from "./packs-provider";
import Sticker from "./sticker";

interface StickerPackProps {
  pack: ServerStickerPack;
  removePack?: (id: string) => Promise<void>;
}

const StickerPack: Component<StickerPackProps> = ({
  pack,
  removePack,
}: StickerPackProps) => {
  const [stickers, setStickers] = createSignal<ServerSticker[]>();
  const [folded, setFolded] = createSignal<boolean>(false);
  setStickers(pack.stickers);

  async function handleStickerTap({ target }: Event) {
    if (
      !(
        target instanceof HTMLImageElement || target instanceof HTMLVideoElement
      )
    )
      return;

    const path = new URL(target.src).pathname.split("/");
    const mediaId = path[path.length - 1];

    const sticker = stickers()?.find((s) => s.mediaId === mediaId);
    if (!sticker) return;

    await widgetApi.sendSticker(makeSticker(sticker));
  }

  if (Cookie.get(`${pack.id}_folded`) === "true") setFolded(true);

  const toggleFold = () => {
    setFolded(!folded());
    Cookie.set(`${pack.id}_folded`, String(folded()));
  };

  const getRemoveFunction = () => {
    if (!removePack)
      throw new Error("getting remove function in different context");
    return removePack;
  };

  return (
    <div>
      <div class={styles.packTitle} onClick={toggleFold}>
        <h4 id={pack.id.toLowerCase()}>{pack.name}</h4>
        <Show when={folded()} keyed>
          <div>&ltfolded&gt</div>
        </Show>
        <Show when={removePack} fallback={<div></div>} keyed>
          <div onClick={[getRemoveFunction(), pack.id]}>X</div>
        </Show>
      </div>
      <Show when={!folded()} keyed>
        <div class={styles.stickers}>
          <For each={stickers()}>
            {(sticker) => (
              <Sticker
                sticker={sticker}
                css={styles.sticker}
                onClick={handleStickerTap}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

const Stickers: Component<{ authData: AuthData }> = (props: {
  authData: AuthData;
}) => {
  const { authData } = props;

  const pik = new PikApi(import.meta.env.VITE_API_URL, authData.apiToken);

  const { userPacksRes, groupPacksRes, trendingPacksRes } = usePacks();
  const [userPacks, setUserPacks] = userPacksRes,
    [groupPacks] = groupPacksRes,
    [trendingPacks] = trendingPacksRes;

  const [noUserPacks, setNoUserPacks] = createSignal(false);

  createEffect(() => {
    if (userPacks()?.length === 0) setNoUserPacks(true);
  });

  const removePack = async (id: string): Promise<void> => {
    await pik.removePack(USERID, id);
    setUserPacks.refetch();
  };

  setInterval(() => {
    setUserPacks.refetch();
  }, 30000);

  return (
    <div class={styles.packsContainer}>
      <Show when={userPacks.loading && groupPacks.loading} keyed>
        <span>Loading...</span>
      </Show>
      <Show when={groupPacks()?.length} keyed>
        <span>This group packs:</span>
        <For each={groupPacks()}>{(pack) => <StickerPack pack={pack} />}</For>
      </Show>
      <Show when={noUserPacks()} keyed>
        <span>
          Seems like, you don't have any packs. Add them using&nbsp
          <code style="background-color: lightgray">
            <a href="https://matrix.to/#/@pik:virto.community">
              @pik:virto.community
            </a>
          </code>
          &nbspbot
        </span>
        <br />
        <button onClick={setUserPacks.refetch}>refresh</button>
        <br />
        <span>Trending stickers:</span>
        <For each={trendingPacks()}>
          {(pack) => <StickerPack pack={pack} />}
        </For>
      </Show>
      <Show when={userPacks()?.length} keyed>
        <Show when={groupPacks()?.length} keyed>
          <span>Your packs:</span>
        </Show>
        <For each={userPacks()}>
          {(pack) => <StickerPack pack={pack} removePack={removePack} />}
        </For>
      </Show>
    </div>
  );
};
export default Stickers;
