import saveOrFindUser from "../../db/save-or-find-user.js";
import client from "../bot.js";
import Werror from "../../lib/error.js";

export default async function authWidget(
  roomId: string,
  userId: string,
  event: string,
  body: string
) {
  const token = body.split(" ")[2];
  if (!token) {
    await client.replyNotice(roomId, event, "You have to specify token");
    return;
  }

  let user;
  try {
    user = await saveOrFindUser(userId, client);
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
