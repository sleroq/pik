import {
  MatrixClient,
  SimpleFsStorageProvider,
  AutojoinRoomsMixin,
  // RustSdkCryptoStorageProvider,
} from "matrix-bot-sdk";
import addTelegramPack from "./lib/telegram/add-pack.js";
import saveOrFindUser from "./db/save-or-find-user.js";

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
  storage,
  // cryptoProvider
);
AutojoinRoomsMixin.setupOnClient(client);

client.on(
  "room.message",
  async function handleCommand(roomId: string, event: any) {
    // Don't handle unhelpful events (ones that aren't text messages, are redacted, or sent by us)
    if (event["content"]?.["msgtype"] !== "m.text") return;
    if (event["sender"] === (await client.getUserId())) return;

    const userId: string = event["sender"];

    // Check to ensure that the `!hello` command is being run
    const body = event["content"]["body"];
    if (!body) return;

    if (body.startsWith("!hello")) {
      await client.replyNotice(roomId, event, "Hello world!");
      return;
    }

    if (body.startsWith("!tg https://t.me/addstickers/")) {
      await client.setTyping(roomId, true, 30000)

      let user;
      try {
        user = await saveOrFindUser(userId, client);
      } catch (error) {
        console.log(error);
        await client.replyNotice(roomId, event, "Something went wrong :c");
        return;
      }

      try {
        await addTelegramPack(user, body.trim().split("/addstickers/")[1]);
      } catch (error) {
        console.log(error);
        await client.replyNotice(roomId, event, "Something went wrong :c");
      }


        await client.replyNotice(roomId, event, "Done!");
        await client.setTyping(roomId, false )
    }

    // Now that we've passed all the checks, we can actually act upon the command
  }
);

client.on("room.join", async (roomId: string, event: any) => {
  // The client has joined `roomId`
  await client.replyNotice(roomId, event, "Добро пожаловать лох");
});

export default client;
