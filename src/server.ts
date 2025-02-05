// src/server.ts - shared server configuration
import express from "express";
import type { Router } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

export const createServer = (router: Router) => {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use("/api/cardano", router);
  
  return app;
};