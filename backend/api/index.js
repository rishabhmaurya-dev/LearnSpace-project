import app from "../src/app.js";
import connectDB from "../src/config/database.js";

let isConnected = false;

async function ensureDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

export default async function handler(req, res) {
  await ensureDB();
  return app(req, res);
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};
