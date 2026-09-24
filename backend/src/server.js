import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool, query } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 5000);
const isProduction = process.env.NODE_ENV === "production";

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false });

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(cookieParser());
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
