import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  // RustSdkCryptoStorageProvider,
} from "matrix-bot-sdk";
import importTelegramPack from "./handlers/import-telegram-pack.js";
import { getServerUrl } from "../lib/matrix.js";
import authWidget from "./handlers/auth-widget.js";

export const homeserverUrl = process.env["HOMESERVER"];
const accessToken = process.env["ACCESS_TOKEN"];

if (!homeserverUrl || !accessToken) {
  throw new Error("Specify homeserver and access_token environment variables");
}

const actualHomeserverUrl = await getServerUrl(homeserverUrl);

const storage = new SimpleFsStorageProvider("bot-state.json");
// const cryptoProvider = new RustSdkCryptoStorageProvider("bot-secrets");

const client = new MatrixClient(
  actualHomeserverUrl,
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
    if (event?.["content"]?.["msgtype"] !== "m.text") return;
    if (event["sender"] === botId) return;

    const userId: string = event["sender"];

    const body = event["content"]?.["body"];
    if (!body) return;

    if (body.startsWith("!pik hello"))
      await handle(roomId, event, async () => {
        await client.replyNotice(roomId, event, "Hello world!");
      });

    if (body.startsWith("!pik auth "))
      await handle(roomId, event, async () => {
        await authWidget(roomId, userId, event, body);
      });

    if (body.startsWith("!pik import https://t.me/addstickers/"))
      await handle(roomId, event, async () => {
        await typing(roomId, true);

        await importTelegramPack(roomId, userId, event, body);

        await typing(roomId, false);
      });

    // Now that we've passed all the checks, we can actually act upon the command
  }
);

client.on("room.join", async (roomId: string, event: any) => {
  await handle(roomId, event, async () => {
    await client.replyNotice(roomId, event, "Добро пожаловать лох");
  });
});

async function handle<F extends Function>(roomId: string, event: string, f: F) {
  try {
    await f();
  } catch (err) {
    console.error(err);
    await errorReply(roomId, event);
  }
}

async function errorReply(roomId: string, event: string, msg?: string) {
  if (!msg) msg = "Something went wrong :(";

  try {
    await client.replyNotice(roomId, event, msg);
  } catch (err) {
    console.error(err);
  }
}

async function typing(roomId: string, state: boolean) {
  try {
    await client.setTyping(roomId, state, 30000);
  } catch (err) {
    console.error(err);
  }
}

export default client;
