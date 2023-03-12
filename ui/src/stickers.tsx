import type { Component } from "solid-js";
import {
  createEffect,
  createResource,
  createSignal,
  For,
  Show,
} from "solid-js";

import styles from "./stickers.module.css";
import widgetApi, { GROUP_PACKS, USERID } from "./connect-widget";
import { IStickerActionRequestData } from "matrix-widget-api";
import { useToken } from "./lib/token";
import Cookie from "./lib/cookie";

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
  removePack: (id: string) => Promise<void>;
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
  removePack,
}: StickerPackProps) => {
  const [stickers, setStickers] = createSignal<ServerSticker[]>();
  const [folded, setFolded] = createSignal<boolean>(false);
  setStickers(pack.stickers);

  async function handleStickerTap({ target }: Event) {
    if (!(target instanceof HTMLImageElement)) return;

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
      </Show>
    </div>
  );
};

const fetchPacks = async (
  userId: string | undefined
): Promise<ServerStickerPack[]> => {
  if (!userId) return [];
  let res;
  try {
    res = await (
      await fetch(new URL(`/api/packs?userId=${userId}`, env.API_URL))
    ).json();
  } catch (err) {
    console.error(err);
  }
  if (res.error) {
    console.error(res.error);
  }
  return res?.data || [];
};

const sendRemovePack = async (
  userId: string,
  token: string,
  packId: string
): Promise<Response> =>
  await fetch(new URL(`/api/removePack`, env.API_URL), {
    method: "POST",
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      packId: packId,
      userId: userId,
    }),
  });

const Stickers: Component = () => {
  const [userId, setUserId] = createSignal(USERID);
  const [noUserPacks, setNoUserPacks] = createSignal(false);
  const [userPacks, setUserPacks] = createResource(userId, fetchPacks);
  const [groupPacks] = createResource(GROUP_PACKS, fetchPacks);
  const token = useToken();

  createEffect(() => {
    if (userPacks()?.length === 0) {
      setUserId(env.TRENDING_USER);
      setNoUserPacks(true);
    }
  });

  const removePack = async (id: string): Promise<void> => {
    await sendRemovePack(USERID, token, id);
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
            Seems like, you don't have any packs. Add them using
            <code style="background-color: lightgray">
              <a href="https://matrix.to/#/@pik:virto.community">
                @pik:virto.community
              </a>
            </code>
            bot
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
