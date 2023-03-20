import { Schema, model, Document } from "mongoose";

interface ISticker {
  packId: string;
  mediaId: string;
  server: string;
  serverAddress: string;
  name: string;
  description: string;
  width: number;
  height: number;
  isVideo: boolean;
  size: number;
}
const stickerSchema = new Schema<ISticker>({
  packId: { type: String, required: true },
  mediaId: { type: String, required: true },
  server: { type: String, required: true },
  serverAddress: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  isVideo: { type: Boolean, required: true },
  size: { type: Number, required: true },
});
export type Sticker = ISticker & Document<any, any, ISticker>;
export const StickerModel = model<ISticker>("Sticker", stickerSchema);

interface IStickerPack {
  id: string;
  source?: string;
  name: string;
  stickers: ISticker[];
}
export const stickerPackSchema = new Schema<IStickerPack>({
  id: { type: String, required: true },
  source: String,
  name: { type: String, required: true },
  stickers: { type: [stickerSchema], required: true },
});
export const StickerPackModel = model<IStickerPack>(
  "StickerPack",
  stickerPackSchema
);
