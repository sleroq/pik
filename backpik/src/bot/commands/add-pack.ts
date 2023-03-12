import { MatrixClient } from "matrix-bot-sdk";
import Werror from "../../lib/error.js";
import { MyMessageEvent } from "../lib.js";
import { readMetadata } from "../../lib/metadata.js";
import { APP_URL } from "./import-telegram-pack.js";
import { StickerPackModel } from "../../db/sticker-pack.model.js";
import saveOrFindUser from "../../db/save-or-find-user.js";

export default async function addPack(
  roomId: string,
  event: MyMessageEvent,
  args: string[],
  client: MatrixClient
) {
  let user;
  try {
    user = await saveOrFindUser(event.sender, client);
  } catch (error) {
    throw new Werror(error, "getting/saving user");
  }

  if (args[2]) {
    return; // FIXME: From url
  }
  if (!event.replyEvent) return;

  let reply;
  try {
    reply = await client.getEvent(roomId, event.replyEvent);
  } catch (err) {
    throw new Werror(err, "getting reply info");
  }

  if (reply.type !== "m.sticker") {
    await client.replyNotice(roomId, event, "This is not a sticker");
    return;
  }

  const file = await client.downloadContent(reply.content.url, true);

  const metadata = readMetadata(file.data);

  if (!metadata.sourceUrl) {
    await client.replyNotice(
      roomId,
      event,
      "Don't have about in this sticker!"
    );
    return;
  }

  const packSource = new URL(metadata.sourceUrl);

  if (packSource.origin === new URL(APP_URL).origin) {
    const packId = packSource.pathname.split("/").pop();

    if (!packId) {
      await client.replyNotice(roomId, event, "Strange source. Idk what to do");
      return;
    }

    const pack = await StickerPackModel.findOne({ id: packId });
    if (!pack) {
      await client.replyNotice(
        roomId,
        event,
        "Strange.. I don'r rememver this pack. Sorry :("
      );
      return;
    }

    user.packs.push(packId);
    user.save();
    await client.replyNotice(roomId, event, "Done!");
  } else {
    await client.replyNotice(
      roomId,
      event,
      "Downloading stickers from other Pik instances is not implemented yet"
    );
  }
}
