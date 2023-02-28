import express, { Request, Response } from 'express';
import client from "./bot";

const PORT = process.env['PORT'] || 3000;

const app = express();

interface APIRequest extends Request {
    query: { user?: string };
}

app.get("/stickers", async (req: APIRequest, res: Response) => {
    let user: string | undefined = req.query.user;

    if (!user) {
        return res.json({
            error: 'no user specified!',
        });
    }

    return res.json({ data: "meow" });
})

app.listen(PORT, async () => {
    console.log('Server is up!');
    await client.start()
    console.log("Bot started!");
});
