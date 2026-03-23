import { Router } from "express";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { db } from "../db/index.js";
import { settings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// All settings routes require auth
router.use(authMiddleware);

// GET /api/settings
router.get("/", (req: Request, res: Response) => {
  try {
    const userSettings = db.select().from(settings).where(eq(settings.userId, req.userId!)).get();

    if (!userSettings) {
      // Return defaults
      res.json({
        success: true,
        data: {
          vapiApiKey: "",
          vapiAssistantId: "",
          defaultVoice: "alloy",
          callScript: "",
          webhookUrl: "",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        vapiApiKey: userSettings.vapiApiKey || "",
        vapiAssistantId: userSettings.vapiAssistantId || "",
        defaultVoice: userSettings.defaultVoice,
        callScript: userSettings.callScript || "",
        webhookUrl: userSettings.webhookUrl || "",
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch settings",
    });
  }
});

// PUT /api/settings
router.put("/", (req: Request, res: Response) => {
  try {
    const { vapiApiKey, vapiAssistantId, defaultVoice, callScript, webhookUrl } = req.body;

    const existing = db.select().from(settings).where(eq(settings.userId, req.userId!)).get();

    if (existing) {
      db.update(settings)
        .set({
          vapiApiKey: vapiApiKey ?? existing.vapiApiKey,
          vapiAssistantId: vapiAssistantId ?? existing.vapiAssistantId,
          defaultVoice: defaultVoice ?? existing.defaultVoice,
          callScript: callScript ?? existing.callScript,
          webhookUrl: webhookUrl ?? existing.webhookUrl,
        })
        .where(eq(settings.userId, req.userId!))
        .run();
    } else {
      db.insert(settings).values({
        id: randomUUID(),
        userId: req.userId!,
        vapiApiKey: vapiApiKey || null,
        vapiAssistantId: vapiAssistantId || null,
        defaultVoice: defaultVoice || "alloy",
        callScript: callScript || null,
        webhookUrl: webhookUrl || null,
      }).run();
    }

    const updated = db.select().from(settings).where(eq(settings.userId, req.userId!)).get();

    res.json({
      success: true,
      data: {
        vapiApiKey: updated?.vapiApiKey || "",
        vapiAssistantId: updated?.vapiAssistantId || "",
        defaultVoice: updated?.defaultVoice || "alloy",
        callScript: updated?.callScript || "",
        webhookUrl: updated?.webhookUrl || "",
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to update settings",
    });
  }
});

export default router;
