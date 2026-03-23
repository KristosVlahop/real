import { Router } from "express";
import type { Request, Response } from "express";
import { randomUUID, createHash } from "crypto";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { storeToken, removeToken, authMiddleware } from "../middleware/auth.js";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "spero-salt").digest("hex");
}

// POST /api/auth/register
router.post("/register", (req: Request, res: Response) => {
  try {
    const { email, password, name, company } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, error: "Email, password, and name are required" });
      return;
    }

    // Check if user already exists
    const existing = db.select().from(users).where(eq(users.email, email)).get();
    if (existing) {
      res.status(409).json({ success: false, error: "User with this email already exists" });
      return;
    }

    const userId = randomUUID();
    const now = new Date().toISOString();

    db.insert(users).values({
      id: userId,
      email,
      name,
      passwordHash: hashPassword(password),
      company: company || "",
      createdAt: now,
    }).run();

    const token = randomUUID();
    storeToken(token, userId);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: userId, email, name, company: company || "" },
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Registration failed",
    });
  }
});

// POST /api/auth/login
router.post("/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Email and password are required" });
      return;
    }

    const user = db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }

    if (user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ success: false, error: "Invalid email or password" });
      return;
    }

    const token = randomUUID();
    storeToken(token, user.id);

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, company: user.company },
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Login failed",
    });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, (req: Request, res: Response) => {
  try {
    const user = db.select().from(users).where(eq(users.id, req.userId!)).get();
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch user",
    });
  }
});

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    removeToken(token);
  }
  res.json({ success: true, message: "Logged out" });
});

export default router;
