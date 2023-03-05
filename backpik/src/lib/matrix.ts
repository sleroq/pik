import { MatrixClient } from "matrix-bot-sdk";

export default async function editMessage(
  client: MatrixClient,
  roomId: string,
  messageId: string,
  text: string
) {
  if (typeof messageId !== 'string') {
    return
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
