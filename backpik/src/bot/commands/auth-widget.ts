import saveOrFindUser from "../../db/save-or-find-user.js";
import Werror from "../../lib/error.js";
import {
  MatrixClient,
  MessageEvent,
  MessageEventContent,
} from "matrix-bot-sdk";

export default async function authWidget(
  roomId: string,
  event: MessageEvent<MessageEventContent>,
  args: string[],
  client: MatrixClient
) {
  const token = args[1];
  if (!token) {
    await client.replyNotice(roomId, event, "You have to specify token");
    return;
  }

  let user;
  try {
    user = await saveOrFindUser(event.sender, client);
  } catch (error) {
    throw new Werror(error, "getting/saving user");
  }

  user.tokens.push({
    token: token,
    date: new Date(),
  });

  while (user.tokens.length > 20) {
    user.tokens.shift();
  }

  await user.save();

  await client.replyNotice(roomId, event, "Success!");
}
