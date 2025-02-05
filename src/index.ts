// code to run the server and listen on port 5002

//index.ts
import express, { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getBalance } from "./controllers/balanceService";
import { getTokenMetadata } from "./controllers/tokenService";

dotenv.config();

const app = express();
const MAIN_PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Create combined router
const router = Router();
router.get("/balance/:walletAddress", getBalance);
router.get("/tokens/:assetId", getTokenMetadata);
router.get("/tokens", (req, res) => {
  return res.status(400).json({ success: false, error: "Asset ID is required" });
});

// Use the combined router
app.use("/api/cardano", router);

if (process.env.NODE_ENV !== "test") {
  app.listen(MAIN_PORT, () => {
    console.log(`🚀 Cardano Services running together on port ${MAIN_PORT}`);
  });
}

export default app;