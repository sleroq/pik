import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  // RustSdkCryptoStorageProvider,
} from "matrix-bot-sdk";
import importTelegramPack from "./handlers/import-telegram-pack.js";

const homeserverUrl = process.env["HOMESERVER"];
const accessToken = process.env["ACCESS_TOKEN"];

if (!homeserverUrl || !accessToken) {
  throw new Error("Specify homeserver and access_token environment variables");
}

const storage = new SimpleFsStorageProvider("bot-state.json");
// const cryptoProvider = new RustSdkCryptoStorageProvider("bot-secrets");

const client = new MatrixClient(
  homeserverUrl,
  accessToken,
  storage
  // cryptoProvider
);
AutojoinRoomsMixin.setupOnClient(client);

const botId = await client.getUserId();

client.on(
  "room.message",
  async function handleCommand(roomId: string, event: any) {
    // Don't handle unhelpful events (ones that aren't text messages, are redacted, or sent by us)
    if (event["content"]?.["msgtype"] !== "m.text") return;
    if (event["sender"] === botId) return;

    const userId: string = event["sender"];

    // Check to ensure that the `!hello` command is being run
    const body = event["content"]["body"];
    if (!body) return;

    if (body.startsWith("!hello")) {
      await client.replyNotice(roomId, event, "Hello world!");
      return;
    }

    if (body.startsWith("!import https://t.me/addstickers/")) {
      await client.setTyping(roomId, true, 30000);

      try {
        await importTelegramPack(roomId, userId, event, body);
      } catch (err) {
        console.error(err);
        await client.replyNotice(roomId, event, "Something went wrong :(");
      }

      await client.setTyping(roomId, false);
    }

    // Now that we've passed all the checks, we can actually act upon the command
  }
);

client.on("room.join", async (roomId: string, event: any) => {
  // The client has joined `roomId`
  await client.replyNotice(roomId, event, "Добро пожаловать лох");
});

export default client;
