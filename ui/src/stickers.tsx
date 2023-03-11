import type { Component } from "solid-js";
import {
  createEffect,
  createResource,
  createSignal,
  For,
  Show,
} from "solid-js";

import styles from "./stickers.module.css";
import widgetApi, { USERID } from "./connect-widget";
import { IStickerActionRequestData } from "matrix-widget-api";

interface StickerPack {
  name: string;
  stickers: IStickerActionRequestData[];
}

interface ServerSticker {
  packId: string;
  mediaId: string;
  server: string;
  serverAddress: string;
  description: string;
  width: number;
  height: number;
}

interface ServerStickerPack {
  id: string;
  source: string;
  name: string;
  stickers: ServerSticker[];
}

interface StickerPackProps {
  pack: ServerStickerPack;
}

const makeSticker = (s: ServerSticker): IStickerActionRequestData => {
  const server = new URL(s.server);

  return {
    name: s.description, // TODO: Add actual names?
    description: s.description,
    content: {
      url: `mxc://${server.host}/${s.mediaId}`,
      info: {
        h: s.height,
        w: s.width,
        mimetype: "image/webp", // TODO: Save format
        size: 164934,
      },
    },
  };
};

const StickerPack: Component<StickerPackProps> = ({
  pack,
}: StickerPackProps) => {
  const [stickers, setStickers] = createSignal<ServerSticker[]>();
  setStickers(pack.stickers);

  async function handleStickerTap({ target }: Event) {
    if (!(target instanceof HTMLImageElement)) return;

    const path = new URL(target.src).pathname.split("/");
    const mediaId = path[path.length - 1];

    const sticker = stickers()?.find((s) => s.mediaId === mediaId);
    if (!sticker) return;

    await widgetApi.sendSticker(makeSticker(sticker));
  }

  return (
    <div>
      <div class={styles.packTitle}>{pack.name}</div>
      <div class={styles.stickers}>
        <For each={stickers()}>
          {(sticker) => {
            const server = new URL(sticker.server);
            const readServer = new URL(sticker.serverAddress);
            const srcUrl = `${readServer.origin}/_matrix/media/r0/download/${server.host}/${sticker.mediaId}`;

            return (
              // TODO: Make a custom element and pass sticker?
              <div class={styles.sticker}>
                <img
                  src={srcUrl}
                  onClick={handleStickerTap}
                  class={styles.image}
                  alt={sticker.description}
                />
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

const fetchPacks = async (userId: string): Promise<ServerStickerPack[]> => {
  let res;
  try {
    res = await (
      await fetch(
        new URL(`/api/packs?userId=${userId}`, env.API_URL)
      )
    ).json();
  } catch (err) {
    console.error(err);
  }
  if (res.error) {
    console.error(res.error);
  }
  return res?.data || [];
};

const Stickers: Component = () => {
  const [userId, setUserId] = createSignal(USERID);
  const [noPacks, setNoPacks] = createSignal(false);
  const [packs] = createResource(userId, fetchPacks);

  createEffect(() => {
    if (packs()?.length === 0) {
      setUserId("@trending-packs:sleroq.link");
      setNoPacks(true);
    }
  });

  return (
    <div>
      <div>
        <span>{packs.loading && "Loading..."}</span>
        <Show when={noPacks()}>
          <span>
            Seems like, you don't have any packs. Add them using
            <code style="background-color: lightgray">
              <a href="https://matrix.to/#/@pik:virto.community">
                @pik:virto.community
              </a>
            </code>
            bot
          </span>
          <br />
          <br />
          <span>Trending stickers:</span>
        </Show>
        <For each={packs()}>{(pack) => <StickerPack pack={pack} />}</For>
      </div>
    </div>
  );
};
export default Stickers;
