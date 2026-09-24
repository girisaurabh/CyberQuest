import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { query } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));

const signupSchema = z.object({
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
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Authentication required." });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}

app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch {
    res.status(503).json({ ok: false, database: "unavailable" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
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
    res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create the account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
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
    res.json({ user, token: createToken(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to sign in." });
  }
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
