import express, { Request, Response } from "express";
import { StickerPackModel } from "./db/sticker-pack.model.js";
import { UserModel } from "./db/user.model.js";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

interface PacksRequest extends Request {
  query: { userId?: string };
}

app.get("/api/packs", async (req: PacksRequest, res: Response) => {
  const userId: string | undefined = req.query.userId;

  if (!userId) return missing(res, "userId");

  let packs;
  try {
    packs = await getPacks(userId);
  } catch (error) {
    if (error instanceof Error && error.message.includes("no such user")) {
      res.status(404).json({ error: "No such user" });
      return;
    }

    res.status(500).json({ error: "something went wrong" });
  }

  return res.json({ data: packs });
});

async function getPacks(userId: string) {
  const user = await UserModel.findOne({ id: userId });
  if (!user) throw new Error("no such user");

  return StickerPackModel.find({ id: user.packs });
}

interface RemovePackRequest extends Request {
  body: {
    userId?: string;
    packId?: string;
  };
}

app.post("/api/removePack", async (req: RemovePackRequest, res: Response) => {
  const userId: string | undefined = req.body.userId;
  const packId: string | undefined = req.body.packId;
  const token = req.headers.authorization?.split(" ")[1];

  if (!userId) return missing(res, "userId");
  if (!packId) return missing(res, "packId");
  if (!token) return missing(res, "token");

  const user = await UserModel.findOne({ id: userId });
  if (!user) return res.status(404).json({ error: "No such user" });

  if (!user.tokens.find((t) => t.token === token))
    return res.status(403).json({ error: "Incorrect auth token" });

  user.packs = user.packs.filter((p) => p !== packId);

  await user.save();

  return res.json({ data: user.packs });
});

function missing(res: Response, thing: string) {
  return res.status(400).json({ error: `no ${thing} was provided` });
}

export default app;
