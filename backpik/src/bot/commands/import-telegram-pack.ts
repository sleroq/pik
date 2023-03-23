import saveOrFindUser from "../../db/save-or-find-user.js";
import client, { homeserverUrl } from "../bot.js";
import {
  Sticker,
  StickerModel,
  StickerPackModel,
} from "../../db/sticker-pack.model.js";
import {
  MatrixClient,
  MessageEventContent,
  MessageEvent,
} from "matrix-bot-sdk";
import { User } from "../../db/user.model.js";
import editMessage from "../../lib/matrix.js";
import {
  downloadFile,
  getFileInfo,
  getPackInfo,
  TelegramSticker,
} from "../../lib/telegram.js";
import Werror from "../../lib/error.js";
import { writeMetadata } from "../../lib/metadata.js";

const APP_URL_ENV = process.env["APP_URL"];
if (!APP_URL_ENV) {
  throw new Error("API_URL is not specified");
}

// Check if url is valid
export const APP_URL = new URL(APP_URL_ENV).toString();

interface QueueItem {
  roomId: string;
  userId: string;
  body: string;
  packName: string;
  botMsgId: string;
}

const queue: QueueItem[] = [];
let processing = false;

export default async function importTelegramPack(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient
) {
  let user;
  try {
    user = await saveOrFindUser(event.sender, client);
  } catch (error) {
    throw new Werror(error, "getting/saving user");
  }

  const packName = args[1]?.match(/t\.me\/addstickers\/(.+)($|\s)/m)?.[1];
  if (!packName) {
    await client.replyNotice(roomId, event, "Pack not found in url");
    return;
  }

  // Try to find if already exists
  let stickerPack = await StickerPackModel.findOne({ id: `tg-${packName}` });
  if (stickerPack) {
    if (!user.packs.includes(stickerPack.id)) {
      user.packs.push(stickerPack.id);
      await user.save();
      await client.replyNotice(roomId, event, "Added this pack");
    } else {
      await client.replyNotice(roomId, event, "You already have this pack");
    }
    return;
  }

  if (queue.find((i) => i.packName === packName)) {
    await client.replyNotice(roomId, event, "Already queued");
    return;
  }

  const botMsgId = await client.replyNotice(
    roomId,
    event,
    "Added to the queue."
  );

  queue.push({
    roomId,
    userId: event.sender,
    body: event.content.body,
    packName,
    botMsgId,
  });

  if (!processing) {
    void processQueue(queue, user, client);
  }
}

async function processQueue(
  queue: QueueItem[],
  user: User,
  client: MatrixClient
) {
  processing = true;
  const req = queue[queue.length - 1];
  if (!req) {
    processing = false;
    return;
  }

  try {
    console.log(`processing ${req.packName}`);
    await processItem(client, queue, req, user);
  } catch (error) {
    console.error("processing queue: ", error);
    await editErrorMessage(
      client,
      req.roomId,
      req.botMsgId,
      "Something went wrong :("
    );
  }

  queue.pop();

  try {
    await processQueue(queue, user, client);
  } catch (error) {
    processing = false;
    console.error("processing queue: ", error);
    await editErrorMessage(
      client,
      req.roomId,
      req.botMsgId,
      "Something went wrong :("
    );
  }
}

async function processItem(
  client: MatrixClient,
  queue: QueueItem[],
  req: QueueItem,
  user: User
) {
  for (const [i, r] of queue.entries()) {
    await editMessage(client, r.roomId, r.botMsgId, `${i + 1}/${queue.length}`);
  }

  await editMessage(client, req.roomId, req.botMsgId, "Importing your pack");

  try {
    await addTelegramPack(user, req.packName);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Not supported")) {
        await editMessage(
          client,
          req.roomId,
          req.botMsgId,
          "Animated packs will be supported soon!"
        );
        return;
      } else {
        throw new Werror(error, "adding pack from telegram");
      }
    }
  }

  await editMessage(client, req.roomId, req.botMsgId, "Done!");
}

async function editErrorMessage(
  client: MatrixClient,
  roomId: string,
  botMsgId: string,
  msg: string
) {
  try {
    await editMessage(client, roomId, botMsgId, msg);
  } catch (error) {
    console.error(error);
  }
}

async function addTelegramPack(user: User, packName: string) {
  const stickerPack = new StickerPackModel({
    id: `tg-${packName}`,
    source: `https://t.me/addstickers/${packName}`,
    name: packName,
    stickers: [],
  });

  const pack = await getPackInfo(packName);

  if (pack.is_animated) {
    throw new Error("Not supported");
  }

  // TODO: Do not save same stickers on retry?
  // or just remove duplicates later
  for (const s of pack.stickers) {
    let sticker;
    try {
      sticker = await addTGSticker(s, stickerPack.id, client);
    } catch (error) {
      throw new Error("could not add TG Sticker");
    }

    stickerPack.stickers.push(sticker);
  }

  await stickerPack.save();

  user.packs.push(stickerPack.id);
  await user.save();
}

async function addTGSticker(
  sticker: TelegramSticker,
  packId: string,
  client: MatrixClient
): Promise<Sticker> {
  const fileInfo = await getFileInfo(sticker.file_id);
  let file = await downloadFile(sticker.file_id, fileInfo.file_path);
  const sourceUrl = new URL(`/api/packs/${packId}`, APP_URL).toString();

  // Add pack info to sticker
  file = writeMetadata(file, { sourceUrl });

  // TODO: Convert everything to everything, handle animations
  let contentType = sticker.is_video ? "video/webp" : "image/webp";

  const mxcUrl = await client.uploadContent(file, contentType, "sticker.webp");

  const matrixSticker = new StickerModel({
    packId,
    mediaId: mxcUrl.split("/")[3],
    name: sticker.emoji,
    description: sticker.emoji,
    server: homeserverUrl,
    serverAddress: client.homeserverUrl, // TODO: what if it changes?
    width: sticker.width,
    height: sticker.height,
    isVideo: sticker.is_video,
    size: sticker.file_size,
  });

  await matrixSticker.save();
  return matrixSticker;
}
