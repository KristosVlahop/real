import { Router } from "express";
import type { Request, Response } from "express";
import { storage } from "../storage.js";
import { mapVapiStatusToResult } from "../services/vapi.js";
import { db } from "../db/index.js";
import { callRecords } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * POST /api/webhooks/vapi — Vapi call status webhook
 * Vapi sends updates when call status changes (queued, ringing, in-progress, ended)
 * Docs: https://docs.vapi.ai/server-url
 */
router.post("/vapi", (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.json({ success: true }); // Ack non-message webhooks
      return;
    }

    const type = message.type;
    const callId = message.call?.id;

    if (!callId) {
      res.json({ success: true });
      return;
    }

    console.log(`[Vapi Webhook] ${type} for call ${callId}`);

    if (type === "end-of-call-report" || type === "status-update") {
      const vapiStatus = message.call?.status || message.status || "ended";
      const endedReason = message.call?.endedReason || message.endedReason || "";
      const duration = Math.round(message.call?.costs?.totalDurationSeconds || message.durationSeconds || 0);
      const transcript = message.transcript || message.call?.transcript || "";
      const summary = message.summary || message.call?.summary || "";

      // Find our call record by vapiCallId
      const record = db.select().from(callRecords).where(eq(callRecords.vapiCallId, callId)).get();

      if (record) {
        const mapped = mapVapiStatusToResult(vapiStatus, endedReason);
        const notes = summary || transcript || `Call ${vapiStatus} — ${endedReason}`;

        storage.updateCallRecord(record.id, {
          result: mapped.callResult,
          duration,
          notes: notes.slice(0, 500), // Truncate long transcripts
          sentiment: mapped.sentiment,
          leadStatus: mapped.leadStatus,
        });

        console.log(`[Vapi Webhook] Updated call record ${record.id}: ${mapped.callResult}`);

        // Check for conversion — this is where notifications would fire
        if (mapped.callResult === "converted" || mapped.callResult === "callback_scheduled") {
          console.log(`[Vapi Webhook] 🎉 Lead conversion/callback from call ${callId}`);
          // TODO: Send notification (email, webhook, etc.)
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[Vapi Webhook] Error:", err);
    res.json({ success: true }); // Always ack to prevent retries
  }
});

export default router;
