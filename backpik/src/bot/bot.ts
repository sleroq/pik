import {
  AutojoinRoomsMixin,
  LogLevel,
  LogService,
  MatrixClient,
  RichConsoleLogger,
  RustSdkCryptoStorageProvider,
  SimpleFsStorageProvider,
} from "matrix-bot-sdk";
import * as path from "path";
import CommandHandler from "./commands/handler.js";
import { getServerUrl } from "../lib/matrix.js";

export const homeserverUrl = process.env["HOMESERVER"];
const accessToken = process.env["ACCESS_TOKEN"];

if (!homeserverUrl || !accessToken) {
  throw new Error("Specify homeserver and access_token environment variables");
}

const actualHomeserverUrl = await getServerUrl(homeserverUrl);

LogService.setLogger(new RichConsoleLogger());
LogService.setLevel(LogLevel.ERROR);
LogService.muteModule("Metrics");

const storage = new SimpleFsStorageProvider(
  path.join(process.cwd(), "cache", "bot-state.json")
);
const cryptoStore = new RustSdkCryptoStorageProvider(
  path.join(process.cwd(), "cache", "encrypted")
);

const client = new MatrixClient(
  actualHomeserverUrl,
  accessToken,
  storage,
  cryptoStore
);

AutojoinRoomsMixin.setupOnClient(client);

const botId = await client.getUserId();

// Prepare the command handler
const commands = new CommandHandler(client, botId);
await commands.start();

LogService.info("index", "Starting sync...");

export default client;
