export interface ServerSticker {
  packId: string;
  mediaId: string;
  server: string;
  serverAddress: string;
  description: string;
  width: number;
  height: number;
}

export interface ServerStickerPack {
  id: string;
  source: string;
  name: string;
  stickers: ServerSticker[];
}

export default class PikApi {
  private readonly token: string; // Secret + "." + Password
  apiOrigin: string; // Secret + "." + Password
  constructor(apiOrigin: string, apiToken: string) {
    this.token = apiToken;
    this.apiOrigin = apiOrigin;
  }

  async checkAuth(userId: string): Promise<boolean> {
    const res = await (
      await fetch(new URL(`/api/auth?userId=${userId}`, this.apiOrigin), {
        method: "GET",
        headers: {
          Authorization: `Basic ${this.token}`,
          "Content-Type": "application/json",
        },
      })
    ).json();

    return res?.data?.auth === true;
  }

  async removePack(userId: string, packId: string): Promise<Response> {
    return await fetch(new URL(`/api/removePack`, this.apiOrigin), {
      method: "POST",
      headers: {
        Authorization: `Basic ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        packId: packId,
        userId: userId,
      }),
    });
  }

  async userPacks(userId: string | undefined): Promise<ServerStickerPack[]> {
    if (!userId) return [];
    let res;
    try {
      res = await (
        await fetch(new URL(`/api/packs?userId=${userId}`, this.apiOrigin))
      ).json();
    } catch (err) {
      console.error(err);
    }
    if (res?.error) {
      console.error(res.error);
    }
    return res?.data || [];
  }
}
