import { MatrixClient } from "matrix-bot-sdk";
import got from "got";
import path from "path";

export default async function editMessage(
  client: MatrixClient,
  roomId: string,
  messageId: string,
  text: string
) {
  if (typeof messageId !== "string") {
    return;
  }
  await client.sendEvent(roomId, "m.room.message", {
    body: text,
    "m.new_content": {
      body: text,
      msgtype: "m.text",
    },
    "m.relates_to": {
      event_id: messageId,
      rel_type: "m.replace",
    },
    msgtype: "m.text",
  });
}

interface WellKnown {
  "m.server": string;
}
export async function getServerUrl(server: string): Promise<string> {
  const res = await got(
    path.join(server, "/.well-known/matrix/server")
  ).json<WellKnown>();
  return `https://${res["m.server"].split(":")[0]}`;
}
