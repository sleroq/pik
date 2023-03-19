import { Document, model, Schema } from "mongoose";

export interface Token {
  token: string;
  date: Date;
}

interface IUser {
  id: string;
  name: string;
  packs: string[];
  tokens: Token[];
}

export const userSchema = new Schema<IUser>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  packs: { type: [String], required: true },
  tokens: { type: [{ token: String, date: Date }], required: true },
});

export type User = IUser & Document<any, any, IUser>;
export const UserModel = model<IUser>("User", userSchema);
