import mongoose from "mongoose";
import Werror from "../lib/error.js";

mongoose.set("strictQuery", false);

export default async function connectToMongoDB(url: string) {
  try {
    await mongoose.connect(url);
  } catch (error) {
    throw new Werror(error, "Unable to connect to database :(");
  }
}
