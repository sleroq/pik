import {
  LogService,
  MatrixClient,
  RichReply,
  UserID,
} from "matrix-bot-sdk";
import { escape } from "html-escaper";
import { runHelloCommand } from "./hello.js";
import importTelegramPack from "./import-telegram-pack.js";
import authWidget from "./auth-widget.js";
import addPack from "./add-pack.js";
import { MyMessageEvent} from "../lib.js";

export const COMMAND_PREFIX = "!pik";

export default class CommandHandler {
  private displayName: string = "Pik";
  private readonly userId: string;
  private readonly localpart: string;

  constructor(private client: MatrixClient, userId: string) {
    this.userId = userId;
    this.localpart = new UserID(this.userId).localpart;
  }

  public async start() {
    await this.prepareProfile();

    // Set up the event handler
    this.client.on("room.message", this.onMessage.bind(this));
  }

  private async prepareProfile() {
    try {
      const profile = await this.client.getUserProfile(this.userId);
      if (profile && profile["displayname"])
        this.displayName = profile["displayname"];
    } catch (e) {
      // Non-fatal error - we'll just log it and move on.
      LogService.warn("CommandHandler", e);
    }
  }

  private async onMessage(roomId: string, ev: any) {
    const event = new MyMessageEvent(ev);
    if (event.isRedacted) return; // Ignore redacted events that come through
    if (event.sender === this.userId) return; // Ignore ourselves
    if (event.messageType !== "m.text") return; // Ignore non-text messages

    // Ensure that the event is a command before going on. We allow people to ping
    // the bot as well as using our COMMAND_PREFIX.
    const prefixes = [
      COMMAND_PREFIX,
      `${this.localpart}:`,
      `${this.displayName}:`,
      `${this.userId}:`,
    ];
    const prefixUsed = prefixes.find((p) => event.msg.startsWith(p));
    if (!prefixUsed) return;

    // Check to see what the arguments were to the command
    const args = event.msg.substring(prefixUsed.length).trim().split(" ");

    try {
      switch (args[0]) {
        case "hello":
          return runHelloCommand(roomId, event, args, this.client);
        case "import":
          return importTelegramPack(roomId, event, args, this.client);
        case "auth":
          return authWidget(roomId, event, args, this.client);
        case "add":
          return addPack(roomId, event, args, this.client);
        default: {
          const help =
            "" +
            "!bot hello [user]     - Say hello to a user.\n" +
            "!bot import [url]     - Import sticker pack from telegram.\n" +
            "!bot add [url]        - Add sticker pack from reply or link to image.\n" +
            "!bot auth [token]     - Auth in widget ui.\n" +
            "!bot help             - This menu\n";

          const text = `Help menu:\n${help}`;
          const html = `<b>Help menu:</b><br /><pre><code>${escape(
            help
          )}</code></pre>`;
          const reply = RichReply.createFor(roomId, ev, text, html);
          reply["msgtype"] = "m.notice";
          return this.client.sendMessage(roomId, reply);
        }
      }
    } catch (e) {
      LogService.error("CommandHandler", e);

      const message = "There was an error processing your command";
      return this.client.replyNotice(roomId, ev, message);
    }
  }
}