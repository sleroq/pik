import express, { Request, Response } from "express";
import { StickerPackModel } from "./db/sticker-pack.model.js";
import { UserModel } from "./db/user.model.js";

const app = express();

interface APIRequest extends Request {
  query: { userId?: string };
}

app.get("/api/packs", async (req: APIRequest, res: Response) => {
  let userId: string | undefined = req.query.userId;

  if (!userId) {
    return res.json({
      error: "no userId specified!",
    });
  }

  let packs;
  try {
    packs = await getPacks(userId);
  } catch (error) {
    // TODO: 404
    if (error instanceof Error && error.message.includes("no such user")) {
      res.json({ error: "No such user" });
      return;
    }

    res.json({ error: "something went wrong" });
  }

  return res.json({ data: packs });
});

async function getPacks(userId: string) {
  const user = await UserModel.findOne({ id: userId });
  if (!user) throw new Error("no such user");

  return StickerPackModel.find({ id: user.packs });
}

export default app;
