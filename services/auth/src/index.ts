import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import authRouter from "./routes/auth";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "auth" }));
app.use("/", authRouter);

const PORT = Number(process.env.PORT || 3001);

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  app.listen(PORT, () => console.log(`auth :${PORT}`));
})();
