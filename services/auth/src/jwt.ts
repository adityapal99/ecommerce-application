import jwt from "jsonwebtoken";

const privKey = Buffer.from(process.env.JWT_PRIVATE_KEY_BASE64 || "", "base64").toString("utf-8");
const pubKey  = Buffer.from(process.env.JWT_PUBLIC_KEY_BASE64 || "", "base64").toString("utf-8");

export function signAccessToken(payload: object) {
  return jwt.sign(payload, privKey, { algorithm: "RS256", expiresIn: Number(process.env.ACCESS_TOKEN_TTL || 900) });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, privKey, { algorithm: "RS256", expiresIn: Number(process.env.REFRESH_TOKEN_TTL || 2592000) });
}

export function verify(token: string) {
  return jwt.verify(token, pubKey, { algorithms: ["RS256"] }) as any;
}
