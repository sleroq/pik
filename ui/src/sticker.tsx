import { Component } from "solid-js";
import { ServerSticker } from "./lib/pik-api";

interface StickerProps {
  sticker: ServerSticker;
  css?: string;
  onClick?: (event: Event) => void;
}

const Sticker: Component<StickerProps> = ({
  sticker,
  css,
  onClick,
}: StickerProps) => {
  const server = new URL(sticker.server);
  const readServer = new URL(sticker.serverAddress);
  const srcUrl = `${readServer.origin}/_matrix/media/r0/download/${server.host}/${sticker.mediaId}`;

  if (sticker.isVideo) {
    return (
      <picture class={css}>
        <video autoplay={true} loop={true} src={srcUrl} style={css} />
      </picture>
    );
  } else {
    return (
      <picture class={css} onClick={onClick}>
        <img
          src={srcUrl}
          loading="lazy"
          decoding="async"
          class={css}
          alt={sticker.description}
        />
      </picture>
    );
  }
};

export default Sticker;
