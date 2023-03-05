import app from "./server.js";
import client from "./bot/bot.js";
import connectToMongoDB from "./db/connect.js";

const API_PORT = process.env["API_PORT"] || 3000;
const DB_URL = process.env["MONGODB_CONNECTION_STRING"];

if (!DB_URL) {
  throw new Error(
    "You have to set MONGODB_CONNECTION_STRING environment variable"
  );
}
if (!process.env["TELEGRAM_BOT_TOKEN"]) {
  throw new Error("You have to set TELEGRAM_BOT_TOKEN environment variable");
}

await connectToMongoDB(DB_URL);
console.log("Database connection established!");

void client.start();
console.log("Bot started!");

app.listen(API_PORT, async () => {
  console.log("Server is up!");
});
