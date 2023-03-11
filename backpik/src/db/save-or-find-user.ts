import { User, UserModel } from "./user.model.js";
import { MatrixClient } from "matrix-bot-sdk";

export default async function saveOrFindUser(
  id: string,
  client: MatrixClient
): Promise<User> {
  let user = await UserModel.findOne({ id });
  if (!user) {
    const userInfo = await client.getUserProfile(id);

    user = new UserModel({
      id: id,
      name: userInfo.displayname,
      packs: [], // TODO: Default packs
      tokens: [],
    });

    await user.save();
  }

  return user;
}
