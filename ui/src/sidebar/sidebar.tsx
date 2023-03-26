import { Component, For } from "solid-js";
import { usePacks } from "../packs-provider";
import { ServerStickerPack } from "../lib/pik-api";
import Sticker from "../sticker";
import styles from "./sidebar.module.css";

interface PackItemProps {
  pack: ServerStickerPack;
}

const PackItem: Component<PackItemProps> = ({ pack }: PackItemProps) => {
  return (
    <a href={"#" + pack.id.toLowerCase()}>
      <Sticker sticker={pack.stickers[0]} css={styles.packImage} />
    </a>
  );
};

const Sidebar: Component = () => {
  const { userPacksRes, groupPacksRes } = usePacks();
  const [userPacks] = userPacksRes,
    [groupPacks] = groupPacksRes;

  return (
    <div class={styles.sidebar}>
      <For each={groupPacks()}>{(pack) => <PackItem pack={pack} />}</For>
      <For each={userPacks()}>{(pack) => <PackItem pack={pack} />}</For>
    </div>
  );
};
export default Sidebar;
