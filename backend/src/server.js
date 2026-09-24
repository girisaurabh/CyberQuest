import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import twilio from "twilio";
import helmet from "helmet";
import { z } from "zod";
import { pool, query } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 5000);
const isProduction = process.env.NODE_ENV === "production";

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "20kb" }));
app.use(helmet());

const phoneSchema = z.object({ phone: z.string().regex(/^\\+[1-9]\\d{7,14}$/, "Use international format, e.g. +919876543210") });\n\nconst signupSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(128),
});

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const bearerToken = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const token = bearerToken || req.cookies.cyberquest_session;

  if (!token) return res.status(401).json({ message: "Authentication required." });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}



app.get("/api/dashboard", requireAuth, async (req, res) => {
  try {
    const [userResult, statsResult, skillsResult, missionResult] = await Promise.all([
      query("SELECT id, name, email, xp, level, streak_days FROM users WHERE id = $1", [req.user.sub]),
      query(`SELECT
        (SELECT COUNT(*) FROM missions) AS total_missions,
        (SELECT COUNT(*) FROM mission_progress WHERE user_id = $1 AND status = 'completed') AS completed_missions,
        (SELECT COUNT(*) FROM projects WHERE user_id = $1) AS projects,
        (SELECT COUNT(*) FROM user_badges WHERE user_id = $1) AS badges`, [req.user.sub]),
      query(`SELECT s.name, COUNT(m.id)::int AS total,
        COUNT(mp.mission_id) FILTER (WHERE mp.status = 'completed')::int AS completed
        FROM skills s
        LEFT JOIN missions m ON m.skill_id = s.id
        LEFT JOIN mission_progress mp ON mp.mission_id = m.id AND mp.user_id = $1
        GROUP BY s.id, s.name
        ORDER BY s.id`, [req.user.sub]),
      query(`SELECT m.id, m.title, m.description, m.difficulty, m.estimated_minutes, m.xp_reward,
        s.name AS skill_name, p.name AS phase_name,
        COALESCE(mp.status, 'not_started') AS status
        FROM missions m
        LEFT JOIN skills s ON s.id = m.skill_id
        LEFT JOIN phases p ON p.id = m.phase_id
        LEFT JOIN mission_progress mp ON mp.mission_id = m.id AND mp.user_id = $1
        ORDER BY CASE WHEN COALESCE(mp.status, 'not_started') = 'completed' THEN 1 ELSE 0 END, m.sort_order, m.id
        LIMIT 1`, [req.user.sub])
    ]);

    if (!userResult.rowCount) return res.status(404).json({ message: "User not found." });

    const stats = statsResult.rows[0];
    const total = Number(stats.total_missions);
    const completed = Number(stats.completed_missions);

    res.json({
      user: userResult.rows[0],
      progress: total ? Math.round((completed / total) * 100) : 0,
      stats: {
        modules: 8,
        missions: total,
        completedMissions: completed,
        projects: Number(stats.projects),
        badges: Number(stats.badges),
      },
      skills: skillsResult.rows.map((row) => ({
        name: row.name,
        progress: Number(row.total) ? Math.round((Number(row.completed) / Number(row.total)) * 100) : 0,
      })),
      todayMission: missionResult.rows[0] || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load dashboard." });
  }
});


app.get("/api/journey", requireAuth, async (req, res) => {
  try {
    const result = await query(`SELECT p.id, p.phase_number, p.name, p.description,
      COUNT(m.id)::int AS total_missions,
      COUNT(mp.mission_id) FILTER (WHERE mp.status = 'completed')::int AS completed_missions
      FROM phases p
      LEFT JOIN missions m ON m.phase_id = p.id
      LEFT JOIN mission_progress mp ON mp.mission_id = m.id AND mp.user_id = $1
      GROUP BY p.id, p.phase_number, p.name, p.description
      ORDER BY p.phase_number`, [req.user.sub]);

    res.json({ phases: result.rows.map((phase) => ({
      ...phase,
      progress: phase.total_missions ? Math.round((phase.completed_missions / phase.total_missions) * 100) : 0,
    })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load your journey." });
  }
});

app.get("/api/journey", requireAuth, async (req, res) => {
  try {
    const result = await query(`SELECT p.id, p.phase_number, p.name, p.description,
      COUNT(m.id)::int AS total_missions,
      COUNT(mp.mission_id) FILTER (WHERE mp.status = 'completed')::int AS completed_missions
      FROM phases p
      LEFT JOIN missions m ON m.phase_id = p.id
      LEFT JOIN mission_progress mp ON mp.mission_id = m.id AND mp.user_id = $1
      GROUP BY p.id, p.phase_number, p.name, p.description
      ORDER BY p.phase_number`, [req.user.sub]);

    res.json({ phases: result.rows.map((phase) => ({
      ...phase,
      progress: phase.total_missions ? Math.round((phase.completed_missions / phase.total_missions) * 100) : 0,
    })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load your journey." });
  }
});

app.get("/api/missions", requireAuth, async (req, res) => {
  try {
    const result = await query(`SELECT m.id, m.title, m.description, m.difficulty, m.estimated_minutes, m.xp_reward,
      s.name AS skill_name, p.phase_number, p.name AS phase_name,
      COALESCE(mp.status, 'not_started') AS status
      FROM missions m
      LEFT JOIN skills s ON s.id = m.skill_id
      LEFT JOIN phases p ON p.id = m.phase_id
      LEFT JOIN mission_progress mp ON mp.mission_id = m.id AND mp.user_id = $1
      ORDER BY p.phase_number, m.sort_order, m.id`, [req.user.sub]);

    res.json({ missions: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load missions." });
  }
});

app.post("/api/missions/:missionId/complete", requireAuth, async (req, res) => {
  const missionId = Number(req.params.missionId);
  if (!Number.isInteger(missionId) || missionId < 1) {
    return res.status(400).json({ message: "Invalid mission." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const mission = await client.query(
      "SELECT id, xp_reward FROM missions WHERE id = $1",
      [missionId]
    );
    if (!mission.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Mission not found." });
    }

    const existing = await client.query(
      "SELECT status FROM mission_progress WHERE user_id = $1 AND mission_id = $2 FOR UPDATE",
      [req.user.sub, missionId]
    );

    if (existing.rows[0]?.status === "completed") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Mission already completed." });
    }

    await client.query(`INSERT INTO mission_progress (user_id, mission_id, status, completed_at, attempts)
      VALUES ($1, $2, 'completed', NOW(), 1)
      ON CONFLICT (user_id, mission_id)
      DO UPDATE SET status = 'completed', completed_at = NOW(), attempts = mission_progress.attempts + 1`,
      [req.user.sub, missionId]
    );

    await client.query(`UPDATE users
      SET xp = xp + $2,
          level = FLOOR((xp + $2) / 500) + 1,
          streak_days = CASE
            WHEN last_activity_date = CURRENT_DATE THEN streak_days
            WHEN last_activity_date = CURRENT_DATE - 1 THEN streak_days + 1
            ELSE 1
          END,
          last_activity_date = CURRENT_DATE,
          updated_at = NOW()
      WHERE id = $1`,
      [req.user.sub, mission.rows[0].xp_reward]
    );

    await client.query(`INSERT INTO user_badges (user_id, badge_id)
      SELECT $1, id FROM badges WHERE name = 'First Mission'
      ON CONFLICT DO NOTHING`, [req.user.sub]);

    await client.query("COMMIT");

    const user = await client.query(
      "SELECT id, name, email, xp, level, streak_days FROM users WHERE id = $1",
      [req.user.sub]
    );

    res.json({ message: "Mission completed.", user: user.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Unable to complete mission." });
  } finally {
    client.release();
  }
});


function setSessionCookie(res, user) {
  const token = createToken(user);
  res.cookie("cyberquest_session", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function oauthStateCookie(res, state) {
  res.cookie("cyberquest_oauth_state", state, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });
}

function oauthRedirect(req, res, provider) {
  const state = crypto.randomBytes(24).toString("hex");
  oauthStateCookie(res, state);
  const redirect = provider === "google"
    ? "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        response_type: "code",
        scope: "openid email profile",
        state,
      })
    : "https://www.facebook.com/v23.0/dialog/oauth?" + new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        redirect_uri: process.env.FACEBOOK_CALLBACK_URL,
        response_type: "code",
        scope: "email,public_profile",
        state,
      });
  res.redirect(redirect);
}

function validOAuthConfig(provider) {
  return provider === "google"
    ? Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL)
    : Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && process.env.FACEBOOK_CALLBACK_URL);
}

async function findOrCreateSocialUser({ provider, providerId, email, name }) {
  const normalizedEmail = email?.trim().toLowerCase() || null;
  let result = await query(
    "SELECT id, name, email, xp, level, streak_days FROM users WHERE provider = $1 AND provider_id = $2",
    [provider, providerId]
  );
  if (result.rowCount) return result.rows[0];

  if (normalizedEmail) {
    result = await query("SELECT id, name, email, xp, level, streak_days FROM users WHERE email = $1", [normalizedEmail]);
    if (result.rowCount) {
      await query("UPDATE users SET provider = $2, provider_id = $3, updated_at = NOW() WHERE id = $1", [result.rows[0].id, provider, providerId]);
      return result.rows[0];
    }
  }

  result = await query(
    "INSERT INTO users (name, email, provider, provider_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, xp, level, streak_days",
    [name?.trim().slice(0, 60) || "CyberQuest Learner", normalizedEmail, provider, providerId]
  );
  return result.rows[0];
}

app.get("/api/auth/google", (req, res) => {
  if (!validOAuthConfig("google")) return res.status(503).json({ message: "Google sign-in is not configured yet." });
  oauthRedirect(req, res, "google");
});

app.get("/api/auth/google/callback", async (req, res) => {
  try {
    if (!req.query.code || req.query.state !== req.cookies.cyberquest_oauth_state) return res.status(400).send("Invalid OAuth state.");
    res.clearCookie("cyberquest_oauth_state");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: req.query.code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok) return res.status(401).send("Google authorization failed.");
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.sub || !profile.email) return res.status(400).send("Google did not provide a verified email.");
    const user = await findOrCreateSocialUser({ provider: "google", providerId: profile.sub, email: profile.email, name: profile.name });
    setSessionCookie(res, user);
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  } catch (error) {
    console.error(error);
    res.status(500).send("Google sign-in failed.");
  }
});

app.get("/api/auth/facebook", (req, res) => {
  if (!validOAuthConfig("facebook")) return res.status(503).json({ message: "Facebook sign-in is not configured yet." });
  oauthRedirect(req, res, "facebook");
});

app.get("/api/auth/facebook/callback", async (req, res) => {
  try {
    if (!req.query.code || req.query.state !== req.cookies.cyberquest_oauth_state) return res.status(400).send("Invalid OAuth state.");
    res.clearCookie("cyberquest_oauth_state");
    const tokenResponse = await fetch("https://graph.facebook.com/v23.0/oauth/access_token?" + new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      redirect_uri: process.env.FACEBOOK_CALLBACK_URL,
      code: req.query.code,
    }));
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.access_token) return res.status(401).send("Facebook authorization failed.");
    const profileResponse = await fetch("https://graph.facebook.com/me?fields=id,name,email&access_token=" + encodeURIComponent(tokens.access_token));
    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.id || !profile.email) return res.status(400).send("Facebook did not provide an email. Please use another sign-in method.");
    const user = await findOrCreateSocialUser({ provider: "facebook", providerId: profile.id, email: profile.email, name: profile.name });
    setSessionCookie(res, user);
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  } catch (error) {
    console.error(error);
    res.status(500).send("Facebook sign-in failed.");
  }
});

app.post("/api/auth/phone/send", authLimiter, async (req, res) => {
  const parsed = phoneSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid phone number with country code." });
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) return res.status(503).json({ message: "Phone verification is not configured yet." });
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).verifications.create({ to: parsed.data.phone, channel: "sms" });
    res.json({ message: "Verification code sent." });
  } catch (error) {
    console.error(error);
    res.status(502).json({ message: "Unable to send verification code." });
  }
});

app.post("/api/auth/phone/verify", authLimiter, async (req, res) => {
  const parsed = phoneSchema.extend({ code: z.string().regex(/^\\d{4,10}$/), name: z.string().trim().min(2).max(60) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter your name, phone number, and verification code." });
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) return res.status(503).json({ message: "Phone verification is not configured yet." });
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const check = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({ to: parsed.data.phone, code: parsed.data.code });
    if (check.status !== "approved") return res.status(401).json({ message: "Invalid or expired verification code." });
    let result = await query("SELECT id, name, email, xp, level, streak_days FROM users WHERE phone = $1", [parsed.data.phone]);
    let user;
    if (result.rowCount) {
      user = result.rows[0];
    } else {
      result = await query("INSERT INTO users (name, phone) VALUES ($1, $2) RETURNING id, name, email, xp, level, streak_days", [parsed.data.name, parsed.data.phone]);
      user = result.rows[0];
    }
    setSessionCookie(res, user);
    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(502).json({ message: "Unable to verify phone number." });
  }
});

app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch {
    res.status(503).json({ ok: false, database: "unavailable" });
  }
});

app.post("/api/auth/signup", authLimiter, async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please enter a valid name, email, and password." });

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    const existing = await query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existing.rowCount) return res.status(409).json({ message: "An account with this email already exists." });

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, xp, level, streak_days",
      [name, normalizedEmail, passwordHash]
    );

    const user = result.rows[0];
    const token = createToken(user);
    res.cookie("cyberquest_session", token, { httpOnly: true, secure: isProduction, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create the account." });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please enter a valid email and password." });

  const { email, password } = parsed.data;

  try {
    const result = await query("SELECT id, name, email, password_hash, xp, level, streak_days FROM users WHERE email = $1", [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    delete user.password_hash;
    const token = createToken(user);
    res.cookie("cyberquest_session", token, { httpOnly: true, secure: isProduction, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to sign in." });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("cyberquest_session", { httpOnly: true, secure: isProduction, sameSite: "lax" });
  res.status(204).end();
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name, email, xp, level, streak_days FROM users WHERE id = $1",
      [req.user.sub]
    );
    if (!result.rowCount) return res.status(404).json({ message: "User not found." });
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to load your profile." });
  }
});

app.listen(port, () => {
  console.log(`CyberQuest API running on http://localhost:${port}`);
});
