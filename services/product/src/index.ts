import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import Product from "./models/Product";

const app = express();
app.use(helmet());
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(morgan("combined"));

app.get("/health", (_req, res) => res.json({ ok: true, service: "product" }));

// Seed once on boot if empty
app.post("/seed", async (_req, res) => {
  const count = await Product.countDocuments();
  if (count > 0) return res.json({ ok: true, skipped: true });
  const items = [
    { name: "Wireless Mouse", price: 799, sku: "WM-001" },
    { name: "Mechanical Keyboard", price: 3499, sku: "MK-002" },
    { name: "USB-C Hub", price: 1299, sku: "UH-003" },
    { name: "Laptop Stand", price: 1599, sku: "LS-004" },
    { name: "Noise Cancelling Headphones", price: 5999, sku: "HP-005" }
  ];
  await Product.insertMany(items);
  res.json({ ok: true });
});

app.get("/", async (_req, res) => {
  const items = await Product.find().lean();
  res.json(items);
});

const PORT = Number(process.env.PORT || 3002);

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  app.listen(PORT, () => console.log(`product :${PORT}`));
})();
