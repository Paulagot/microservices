// src/balanceService.ts - entry point for balance service
import { createServer } from "./server";
import express from "express";
import { getBalance } from "./controllers/balanceService";

const router = express.Router();
router.get("/health", (req, res) => {
  res.json({ status: "OK", service: "balance" });
});
router.get("/balance/:walletAddress", getBalance);


const balanceApp = createServer(router);
const BALANCE_PORT = process.env.BALANCE_PORT || 5002;

// Add debugging log to see what's happening with the environment variable
console.log('Environment BALANCE_PORT:', process.env.BALANCE_PORT);
console.log('Using port:', BALANCE_PORT);

if (process.env.NODE_ENV !== "test") {
  balanceApp.listen(BALANCE_PORT, () => {
    console.log(`🚀 Balance Service running on port ${BALANCE_PORT}`);
  });
}

export default balanceApp;