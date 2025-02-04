// code to run the server and listen on port 5002

//index.ts


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cardanoRoutes from "./routes";

// ✅ Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// ✅ Use the correct routes
app.use("/api/cardano", cardanoRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(5002, () => {
    console.log("🚀 Cardano Service running on port 5002");
  });
}
export default app;
