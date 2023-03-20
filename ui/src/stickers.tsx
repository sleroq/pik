import type { Component } from "solid-js";
import {
  createEffect,
  createResource,
  createSignal,
  For,
  Show,
} from "solid-js";

import styles from "./stickers.module.css";
import widgetApi, { GROUP_PACKS, USERID } from "./lib/connect-widget";
import { IStickerActionRequestData } from "matrix-widget-api";
import Cookie from "./lib/cookie";
import PikApi, { ServerSticker, ServerStickerPack } from "./lib/pik-api";
import { AuthData } from "./lib/auth";

interface StickerPackProps {
  pack: ServerStickerPack;
  removePack: (id: string) => Promise<void>;
}

const makeSticker = (s: ServerSticker): IStickerActionRequestData => {
  const server = new URL(s.server);

  return {
    name: s.name,
    description: s.description,
    content: {
      url: `mxc://${server.host}/${s.mediaId}`,
      info: {
        h: s.height,
        w: s.width,
        mimetype: s.isVideo ? "video/webp" : "image/webp",
        size: s.size,
      },
    },
  };
};

const StickerPack: Component<StickerPackProps> = ({
  pack,
  removePack,
}: StickerPackProps) => {
  const [stickers, setStickers] = createSignal<ServerSticker[]>();
  const [folded, setFolded] = createSignal<boolean>(false);
  setStickers(pack.stickers);

  async function handleStickerTap({ target }: Event) {
    if (!(target instanceof HTMLImageElement || target instanceof HTMLVideoElement)) return;

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

  return (
    <div>
      <div class={styles.packTitle} onClick={toggleFold}>
        <div>{pack.name}</div>
        <Show when={folded()} keyed>
          <div>&ltfolded&gt</div>
        </Show>
        <div onClick={[removePack, pack.id]}>X</div>
      </div>
      <Show when={!folded()} keyed>
        <div class={styles.stickers}>
          <For each={stickers()}>
            {(sticker) => {
              const server = new URL(sticker.server);
              const readServer = new URL(sticker.serverAddress);
              const srcUrl = `${readServer.origin}/_matrix/media/r0/download/${server.host}/${sticker.mediaId}`;

              // TODO: Make a custom element and pass sticker?
              if (sticker.isVideo) {
                return (
                    <picture class={styles.sticker}>
                      <video
                          autoplay={true}
                          loop={true}
                          src={srcUrl}
                          onClick={handleStickerTap}
                          class={styles.image}
                      />
                    </picture>
                );
              } else {
                return (
                  <div class={styles.sticker}>
                    <img
                      src={srcUrl}
                      loading="lazy"
                      decoding="async"
                      onClick={handleStickerTap}
                      class={styles.image}
                      alt={sticker.description}
                    />
                  </div>
                );
              }
            }}
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

  const [userId, setUserId] = createSignal(USERID);
  const pik = new PikApi(import.meta.env.VITE_API_URL, authData.apiToken);

  const [noUserPacks, setNoUserPacks] = createSignal(false);
  const [userPacks, setUserPacks] = createResource(
    userId,
    pik.userPacks.bind(pik)
  );
  const [groupPacks] = createResource(GROUP_PACKS, pik.userPacks.bind(pik));

  createEffect(() => {
    if (userPacks()?.length === 0) {
      setUserId(import.meta.env.VITE_TRENDING_USER);
      setNoUserPacks(true);
    }
  });

  const removePack = async (id: string): Promise<void> => {
    await pik.removePack(USERID, id);
    setUserPacks.refetch();
  };

  setInterval(() => {
    setUserPacks.refetch();
  }, 30000);

  return (
    <div>
      <div>
        <Show when={userPacks.loading && groupPacks.loading} keyed>
          <span>Loading...</span>
        </Show>
        <Show when={groupPacks()?.length} keyed>
          <span>This group packs:</span>
          <For each={groupPacks()}>
            {(pack) => <StickerPack pack={pack} removePack={removePack} />}
          </For>
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
        </Show>
        <Show when={!noUserPacks() && groupPacks()?.length} keyed>
          <span>Your packs:</span>
        </Show>
        <For each={userPacks()}>
          {(pack) => <StickerPack pack={pack} removePack={removePack} />}
        </For>
      </div>
    </div>
  );
};
export default Stickers;
