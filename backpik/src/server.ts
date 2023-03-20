import express, { Request, Response } from "express";
import { StickerPackModel } from "./db/sticker-pack.model.js";
import { Token, UserModel } from "./db/user.model.js";
import bodyParser from "body-parser";
import { aesGcmEncrypt } from "./lib/crypto.js";
import Werror from "./lib/error.js";

const app = express();

app.use(bodyParser.json());

interface PacksRequest extends Request {
  query: { userId?: string };
}
// TODO: JSONApi
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

    console.error(error);
    res.status(500).json({ error: "something went wrong" });
    return;
  }

  return res.json({ data: packs });
});

async function getPacks(userId: string) {
  const user = await UserModel.findOne({ id: userId });
  if (!user) throw new Error("no such user");

  return StickerPackModel.find({ id: user.packs });
}

interface PackRequest extends Request {
  params: {
    id?: string;
  };
}

app.get("/api/packs/:id", async (req: PackRequest, res: Response) => {
  const packId: string | undefined = req.params.id;

  if (!packId) return missing(res, "packId");

  let pack;
  try {
    pack = await StickerPackModel.findOne({ id: packId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "something went wrong" });
    return;
  }

  if (!pack) {
    res.status(404).json({ error: "No such pack" });
    return;
  }

  return res.json({ data: pack });
});

interface AuthRequest extends Request {
  query: {
    userId?: string;
    token?: string;
  };
}

app.get("/api/auth", async (req: AuthRequest, res: Response) => {
  const userId: string | undefined = req.query.userId;
  const token = req.headers.authorization?.split(" ")[1];

  if (!userId) return missing(res, "userId");
  if (!token) return missing(res, "token");

  const user = await UserModel.findOne({ id: userId });
  if (!user) return res.status(404).json({ error: "No such user" });

  if (await tokenIsValid(token, user.tokens))
    return res.json({ data: { auth: true } });

  return res.json({ data: { auth: false } });
});

async function tokenIsValid(
  token: string,
  userTokens: Token[]
): Promise<boolean> {
  const [secret, password] = token.split(".");

  if (!secret || !password) {
    return false;
  }

  let encryptedSecret;
  try {
    encryptedSecret = await aesGcmEncrypt(secret, password);
  } catch (err) {
    throw new Werror(err, "Encrypting received secret");
  }

  let userToken = encryptedSecret.slice(0, 8);

  return Boolean(userTokens.find((t) => t.token === userToken));
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

  if (!(await tokenIsValid(token, user.tokens)))
    return res.status(503).json({ error: "Invalid auth token" });

  user.packs = user.packs.filter((p) => p !== packId);

  await user.save();

  return res.json({ data: user.packs });
});

function missing(res: Response, thing: string) {
  return res.status(400).json({ error: `no ${thing} was provided` });
}

export default app;
