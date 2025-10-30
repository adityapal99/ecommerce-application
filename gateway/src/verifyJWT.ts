import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const pubKeyB64 = process.env.JWT_PUBLIC_KEY_BASE64 || "";
const publicKey = Buffer.from(pubKeyB64, "base64").toString("utf-8");

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  // Prefer HttpOnly cookie
  const cookieToken = req.cookies.access_token;
  const token = cookieToken;

  if (!token) return res.status(401).json({ error: "unauthorized" });

  try {
    const payload = jwt.verify(token, publicKey, { algorithms: ["RS256"] }) as any;
    (req as any).user = { sub: payload.sub, email: payload.email };
    if ((req as any).user?.sub) {
      req.headers["x-forwarded-user-id"] = (req as any).user.sub;
    }
    return next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}
