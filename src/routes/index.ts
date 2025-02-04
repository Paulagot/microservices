//routes/index.ts

import express from "express";
import { getBalance } from "../controllers/balanceService";
import { getTokenMetadata } from "../controllers/tokenService";


const router = express.Router();

// Balance Routes
router.get("/balance/:walletAddress", getBalance);

//  Handle requests without an assetId (missing parameter)
router.get("/tokens", (req, res) => {
    return res.status(400).json({ success: false, error: "Asset ID is required" });
  });

// Token Metadata Route
router.get("/tokens/:assetId", getTokenMetadata);

export default router;

