import { component$, useContext, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./sticker-packs.css?inline";
import type { SharedState } from "~/root";
import { MyContext } from "~/root";

export default component$(() => {
  useStylesScoped$(styles);
  const state = useContext<SharedState>(MyContext);

  return (
    <div class="sticker-packs">
      <button
        onClick$={async () => {
          if (!state.api) {
            throw new Error("no api in state!");
          }

          console.log("sending sticker!");

          const sticker = {
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
          };

          await state.api.sendSticker(sticker);
        }}
        className="test-button"
      >
        Send Sticker
      </button>
    </div>
  );
});
