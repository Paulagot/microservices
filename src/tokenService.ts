import { createServer } from "./server";
import express from "express";
import { getTokenMetadata } from "./controllers/tokenService";

const router = express.Router();
router.get("/health", (req, res) => {
  res.json({ status: "OK", service: "token" });
});
router.get("/tokens/:assetId", getTokenMetadata);


router.get("/tokens", (req, res) => {
  return res.status(400).json({ success: false, error: "Asset ID is required" });
});

const tokenApp = createServer(router);
const TOKEN_PORT = process.env.TOKEN_PORT || 5003;

if (process.env.NODE_ENV !== "test") {
  tokenApp.listen(TOKEN_PORT, () => {
    console.log(`🚀 Token Service running on port ${TOKEN_PORT}`);
  });
}

export default tokenApp;