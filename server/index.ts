import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import leadsRouter from "./routes/leads.js";
import authRouter from "./routes/auth.js";
import settingsRouter from "./routes/settings.js";
import webhooksRouter from "./routes/webhooks.js";
import { authMiddleware } from "./middleware/auth.js";
import { storage } from "./storage.js";
import { seedDatabase } from "./db/seed.js";

const app = express();
const PORT = parseInt(process.env.API_PORT || "3001", 10);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Seed database on startup
seedDatabase().catch(console.error);

// Public routes
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/webhooks", webhooksRouter);

// Protected routes
app.use("/api/leads", authMiddleware, leadsRouter);
app.use("/api/settings", settingsRouter); // settings router already applies authMiddleware internally

// GET /api/stats — Dashboard statistics (protected)
app.get("/api/stats", authMiddleware, (req, res) => {
  const stats = storage.getStats(req.userId);
  res.json({ success: true, data: stats });
});

// GET /api/calls — Recent call records (protected)
app.get("/api/calls", authMiddleware, (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const calls = storage.getCallRecords(limit, req.userId);
  res.json({ success: true, data: calls });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Spero AI API server running on port ${PORT}`);
});

export default app;
