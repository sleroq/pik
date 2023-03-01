import { User } from "../../db/user.model.js";
import {
  downloadFile,
  getFileInfo,
  getPackInfo,
  TelegramSticker,
} from "./telegram.js";
import Werror from "../error.js";
import client from "../../bot.js";
import {
  Sticker,
  StickerModel,
  StickerPackModel,
} from "../../db/sticker-pack.model.js";

export default async function addTelegramPack(user: User, packName: string) {
  let stickerPack = await StickerPackModel.findOne({ id: `tg-${packName}` });
  if (stickerPack) {
    user.packs.push(stickerPack.id);
    await user.save()
    return
  }

  let pack;
  try {
    pack = await getPackInfo(packName);
  } catch (error) {
    throw new Werror(error, "getting sticker-pack info");
  }

  stickerPack = new StickerPackModel({
    id: `tg-${packName}`,
    source: `https://t.me/addstickers/${packName}`,
    name: packName,
    stickers: [],
  });

  // TODO: Do not save same stickers on retry
  for (const s of pack.stickers) {
    let sticker;
    try {
      sticker = await addTGSticker(s, stickerPack.id);
    } catch (error) {
      throw new Error("could not add TG Sticker");
    }

    stickerPack.stickers.push(sticker);
  }

  await stickerPack.save();

  user.packs.push(stickerPack.id);
  await user.save()
}

async function addTGSticker(
  sticker: TelegramSticker,
  packId: string
): Promise<Sticker> {
  const fileInfo = await getFileInfo(sticker.file_id);
  const file = await downloadFile(sticker.file_id, fileInfo.file_path);

  // TODO: Convert everything to everything, handle animations
  const contentType = sticker.type == "regular" ? "image/webp" : 'image/webp';

  const mxcUrl = await client.uploadContent(file, contentType, "sticker.webp");

  const matrixSticker = new StickerModel({
    packId,
    mediaId: mxcUrl.split("/")[3],
    description: sticker.emoji,
    server: client.homeserverUrl,
  });

  await matrixSticker.save();
  return matrixSticker;
}
