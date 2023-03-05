import got from "got";
import * as path from "path";

const apiBase = `https://api.telegram.org/bot${process.env["TELEGRAM_BOT_TOKEN"]}`;
const apiFiles = `https://api.telegram.org/file/bot${process.env["TELEGRAM_BOT_TOKEN"]}`;

interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  file_size: number;
  file_path: string;
}

export interface TelegramSticker {
  width: number;
  height: number;
  emoji: string;
  set_name: string;
  is_animated: boolean;
  is_video: boolean;
  type: "regular";
  thumb: unknown;
  file_id: string;
  file_unique_id: string;
  file_size: string;
}

interface TelegramPack {
  name: string;
  title: string;
  is_animated: boolean;
  is_video: boolean;
  sticker_type: "regular";
  contains_masks: boolean;
  stickers: TelegramSticker[];
}

interface ApiResponse<T> {
  ok: boolean;
  result: T;
  error_code?: number;
  description?: string;
}

export async function getFileInfo(id: string) {
  const url = new URL(path.join(apiBase, "getFile"));
  const params = new URLSearchParams({ file_id: id });
  url.search = params.toString();

  const res = await got(url).json<ApiResponse<TelegramFile>>();
  if (!res.ok) {
    throw new Error(`Api response: ${res.error_code} - ${res.description}`);
  }

  return res.result;
}

export async function downloadFile(id: string, fPath: string) {
  const url = new URL(path.join(apiFiles, fPath));
  const params = new URLSearchParams({ file_id: id });
  url.search = params.toString();

  const res = await got<Buffer>(url);
  return res.rawBody;
}

export async function getPackInfo(name: string) {
  const url = new URL(path.join(apiBase, "getStickerSet"));
  const params = new URLSearchParams({ name });
  url.search = params.toString();

  const res = await got(url).json<ApiResponse<TelegramPack>>();
  if (!res.ok) {
    throw new Error(`Api response: ${res.error_code} - ${res.description}`);
  }

  return res.result;
}
