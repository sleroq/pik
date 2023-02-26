import type { Component } from "solid-js";
import { createSignal, For } from "solid-js";

import styles from "./stickers.module.css";
import { widgetApi } from "./connect-widget";
import { IStickerActionRequestData } from "matrix-widget-api";

interface StickerPack {
  name: string;
  stickers: IStickerActionRequestData[];
}

const Stickers: Component = () => {
  const [stickers] = createSignal<StickerPack>({
    name: "pack 1",
    stickers: [
      {
        name: "testing stickers!",
        description:
          "Isabella the Monero Girl glaring at the camera, cheeks red, with steam coming from her ears",
        content: {
          url: "mxc://matrix.org/LLANaPGGqVzrvvQSWSxhSKRI",
          info: {
            h: 256,
            w: 256,
            mimetype: "image/png",
            size: 164934,
          },
        },
      },
      {
        name: "testing stickers!",
        description:
          "A camera set to self-timer is just about to take your picture. Smile!",
        content: {
          url: "mxc://matrix.org/ZOQhwITjfqUKJyStDYlRJNzD",
          info: {
            h: 256,
            w: 256,
            mimetype: "image/gif",
            size: 222782,
          },
        },
      },
    ],
  });

  async function handleStickerTap({ target }: Event) {
    if (!(target instanceof HTMLImageElement)) return;

    const url = "mxc://matrix.org/" + target.src.split("/")[8];

    const sticker = stickers().stickers.find((s) => s.content.url === url);
    if (!sticker) return;
    await widgetApi.sendSticker(sticker);
  }

  return (
    <div>
      <div class={styles.stickerPack}>
        <div class={styles.packTitle}>{stickers().name}</div>
        <div class={styles.stickers}>
          <For each={stickers().stickers}>
            {(sticker) => {
              const url =
                "https://matrix.org/_matrix/media/r0/download/matrix.org/" +
                sticker.content.url.split("/")[3];

              return (
                <img
                  src={`${url}`}
                  onClick={handleStickerTap}
                  class={styles.image}
                />
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div class={styles.stickers}>
  //     <div class="body">
  //
  //       <For each={stickers()}>{(sticker: Sticker) =>
  //         <img src={sticker.content.httpsUrl}>
  //       }</For>
  //
  //     </div>
  //   </div>
  // );
};
export default Stickers;
