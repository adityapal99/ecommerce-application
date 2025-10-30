import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyJWT } from "./verifyJWT";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("combined"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

// Health
app.get("/health", (_req, res) => res.json({ ok: true, service: "gateway" }));

// Public routes forwarded to services
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL!,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
    proxyTimeout: 60000,
    timeout: 60000,
  })
);

app.use(express.json());


app.use(
  "/api/products",
  createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL!,
    changeOrigin: true,
    pathRewrite: { "^/api/products": "" },
  })
);

// Protected routes require access token (from HttpOnly cookie or header)
app.use(verifyJWT);

app.use(
  "/api/cart",
  createProxyMiddleware({
    target: process.env.CART_SERVICE_URL!,
    changeOrigin: true,
    pathRewrite: { "^/api/cart": "" },
    proxyTimeout: 60000,
    timeout: 60000,
    on: {
      proxyReq: (proxyReq, req: any) => {
        if (!req.body) return;
        const b = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(b));
        proxyReq.write(b);
      },
    }
  })
);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`gateway :${PORT}`));
