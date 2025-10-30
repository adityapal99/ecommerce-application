import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { signAccessToken, signRefreshToken, verify } from "../jwt";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const r = Router();

// Passport Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(null, false);
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            provider: "google",
            googleId: profile.id,
          });
        }
        return done(null, { id: user.id, email: user.email, name: user.name, tv: user.tokenVersion });
      } catch (e) {
        done(e);
      }
    }
  )
);

r.get("/health", (_req, res) => res.json({ ok: true }));

// Local signup
r.post("/signup", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email_password_required" });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ error: "email_in_use" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: email.toLowerCase(), name, passwordHash, provider: "local" });
  return res.status(201).json({ id: user.id, email: user.email, name: user.name });
});

// Local login
r.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user || !user.passwordHash) return res.status(401).json({ error: "invalid_credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const access = signAccessToken({ sub: user.id, email: user.email, tv: user.tokenVersion });
  const refresh = signRefreshToken({ sub: user.id, tv: user.tokenVersion });

  setAuthCookies(res, access, refresh);
  return res.json({ ok: true });
});

// Google OAuth start
r.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
r.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/oauth2/failure" }),
  async (req: any, res) => {
    const { id, email, name, tv } = req.user;
    const access = signAccessToken({ sub: id, email, tv });
    const refresh = signRefreshToken({ sub: id, tv });
    setAuthCookies(res, access, refresh);
    // Redirect back to the SPA
    const origin = process.env.CORS_ORIGIN || "http://localhost:5173";
    res.redirect(origin + "/auth/callback");
  }
);

r.get("/oauth2/failure", (_req, res) => res.status(401).json({ error: "oauth_failed" }));

// Refresh token rotation
r.post("/refresh", async (req, res) => {
  const token = (req.cookies?.refresh_token as string) || (req.header("authorization")?.replace("Bearer ", "") ?? "");
  if (!token) return res.status(401).json({ error: "no_refresh_token" });

  try {
    const payload = verify(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "user_not_found" });
    if (payload.tv !== user.tokenVersion) return res.status(401).json({ error: "token_revoked" });

    const access = signAccessToken({ sub: user.id, email: user.email, tv: user.tokenVersion });
    const refresh = signRefreshToken({ sub: user.id, tv: user.tokenVersion });
    setAuthCookies(res, access, refresh);
    return res.json({ ok: true });
  } catch {
    return res.status(401).json({ error: "invalid_refresh" });
  }
});

// Logout current device
r.post("/logout", async (req, res) => {
  clearAuthCookies(res);
  return res.json({ ok: true });
});

// Logout all devices: bump tokenVersion
r.post("/logout-all", async (req, res) => {
  const { email } = req.body || {};
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user) return res.json({ ok: true });
  user.tokenVersion += 1;
  await user.save();
  clearAuthCookies(res);
  return res.json({ ok: true });
});

function setAuthCookies(res: any, access: string, refresh: string) {
  const common = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false, // set true behind HTTPS in production
    domain: "localhost",
    path: "/",
  };
  res.cookie("access_token", access, { ...common, maxAge: Number(process.env.ACCESS_TOKEN_TTL || 900) * 1000 });
  res.cookie("refresh_token", refresh, { ...common, maxAge: Number(process.env.REFRESH_TOKEN_TTL || 2592000) * 1000 });
}
function clearAuthCookies(res: any) {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
}

export default r;
