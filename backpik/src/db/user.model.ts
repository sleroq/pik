import { Document, model, Schema } from "mongoose";

interface IUser {
  id: string;
  name: string;
  packs: string[];
}

export const userSchema = new Schema<IUser>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  packs: { type: [String], required: true },
});

export type User = IUser & Document<any, any, IUser>;
export const UserModel = model<IUser>("User", userSchema);
