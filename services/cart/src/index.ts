import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Cart from "./models/Cart";

const app = express();
app.use(helmet());
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(morgan("combined"));

app.get("/health", (_req, res) => res.json({ ok: true, service: "cart" }));

// Simple auth parse (gateway already verifies). Here we trust the header from gateway.
function getUserId(req: any): string | null {
  const hdr = req.header("x-forwarded-user-id");
  if (hdr) return hdr;
  const auth = req.header("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const token = auth.slice(7);
    const payload = jwt.decode(token) as any;
    return payload?.sub || null;
  } catch {
    return null;
  }
}

app.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const cart = (await Cart.findOne({ userId }).lean()) || { userId, items: [] };
  const total = cart.items.reduce((a, c) => a + (c.price ?? 0) * (c.qty ?? 0), 0);
  res.json({ items: cart.items, total });
});

app.post("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const { productId, name, price, qty } = req.body || {};
  if (!productId || !qty || typeof price !== "number") return res.status(400).json({ error: "bad_request" });

  let cart = await Cart.findOne({ userId });
  if (!cart) cart = new Cart({ userId, items: [] });

  const existing = cart.items.find((i: any) => i.productId === productId);
  if (existing) existing.qty += qty;
  else cart.items.push({ productId, name, price, qty });

  await cart.save();
  res.json({ ok: true });
});

app.delete("/:itemId", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const { itemId } = req.params;
  const cart = await Cart.findOne({ userId });
  if (!cart) return res.json({ ok: true });

  cart.set("items", cart.items.filter((i: any) => String(i._id) !== itemId));
  await cart.save();
  res.json({ ok: true });
});

app.post("/checkout", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const cart = await Cart.findOne({ userId });
  const items = cart?.items || [];
  const total = items.reduce((a: number, c: any) => a + c.price * c.qty, 0);
  // mock receipt
  res.json({ total, timestamp: Date.now(), items });
});

const PORT = Number(process.env.PORT || 3003);

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  app.listen(PORT, () => console.log(`cart :${PORT}`));
})();
