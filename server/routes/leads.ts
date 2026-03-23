import { Router } from "express";
import type { Request, Response } from "express";
import { storage } from "../storage.js";
import {
  createLeadSchema,
  updateLeadSchema,
  leadFiltersSchema,
} from "../schema.js";

const router = Router();

// GET /api/leads — List all leads with filtering/pagination
router.get("/", (req: Request, res: Response) => {
  try {
    const filters = leadFiltersSchema.parse(req.query);
    const result = storage.getLeads(filters, req.userId!);
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : "Invalid filters",
    });
  }
});

// GET /api/leads/:id — Get single lead
router.get("/:id", (req: Request, res: Response) => {
  const lead = storage.getLead(req.params.id, req.userId);
  if (!lead) {
    res.status(404).json({ success: false, error: "Lead not found" });
    return;
  }
  res.json({ success: true, data: lead });
});

// POST /api/leads/upload — CSV upload
router.post("/upload", (req: Request, res: Response) => {
  try {
    const { csv } = req.body as { csv?: string };
    if (!csv || typeof csv !== "string") {
      res
        .status(400)
        .json({ success: false, error: "CSV data is required in body.csv" });
      return;
    }

    const lines = csv.trim().split("\n");
    if (lines.length < 2) {
      res
        .status(400)
        .json({ success: false, error: "CSV must have headers and at least one row" });
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const phoneIdx = headers.indexOf("phone");
    const emailIdx = headers.indexOf("email");
    const companyIdx = headers.indexOf("company");
    const revenueIdx = headers.indexOf("revenue");
    const notesIdx = headers.indexOf("notes");

    if (nameIdx === -1 || phoneIdx === -1) {
      res
        .status(400)
        .json({ success: false, error: 'CSV must have "name" and "phone" columns' });
      return;
    }

    const leadsData = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (!cols[nameIdx] || !cols[phoneIdx]) continue;

      const input = createLeadSchema.parse({
        name: cols[nameIdx],
        phone: cols[phoneIdx],
        email: emailIdx >= 0 ? cols[emailIdx] : "",
        company: companyIdx >= 0 ? cols[companyIdx] : "",
        revenue: revenueIdx >= 0 ? parseFloat(cols[revenueIdx]) || 0 : 0,
        notes: notesIdx >= 0 ? cols[notesIdx] : "",
      });
      leadsData.push(input);
    }

    const created = storage.createLeadsBulk(leadsData, req.userId!);
    res.json({
      success: true,
      data: created,
      message: `Successfully imported ${created.length} leads`,
    });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to parse CSV",
    });
  }
});

// PATCH /api/leads/:id — Update lead
router.patch("/:id", (req: Request, res: Response) => {
  try {
    const input = updateLeadSchema.parse(req.body);
    const lead = storage.updateLead(req.params.id, input, req.userId);
    if (!lead) {
      res.status(404).json({ success: false, error: "Lead not found" });
      return;
    }
    res.json({ success: true, data: lead });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : "Invalid update data",
    });
  }
});

// DELETE /api/leads/:id — Delete lead
router.delete("/:id", (req: Request, res: Response) => {
  const deleted = storage.deleteLead(req.params.id, req.userId);
  if (!deleted) {
    res.status(404).json({ success: false, error: "Lead not found" });
    return;
  }
  res.json({ success: true, message: "Lead deleted" });
});

// POST /api/leads/:id/call — AI call (real via Vapi or simulated)
router.post("/:id/call", async (req: Request, res: Response) => {
  const { isVapiConfigured, createVapiCall } = await import("../services/vapi.js");
  const lead = storage.getLead(req.params.id, req.userId);
  if (!lead) {
    res.status(404).json({ success: false, error: "Lead not found" });
    return;
  }

  // Try real Vapi call if configured
  if (isVapiConfigured(req.userId!)) {
    try {
      const vapiResult = await createVapiCall(req.userId!, {
        phoneNumber: lead.phone,
        leadName: lead.name,
        leadCompany: lead.company,
      });

      const record = storage.startCall(req.params.id, req.userId!, vapiResult.id);
      res.json({
        success: true,
        data: record,
        message: "AI call initiated via Vapi",
        provider: "vapi",
        vapiCallId: vapiResult.id,
      });
      return;
    } catch (err: unknown) {
      // If Vapi fails, tell the user instead of falling back silently
      res.status(400).json({
        success: false,
        error: err instanceof Error ? err.message : "Vapi call failed",
      });
      return;
    }
  }

  // Fallback to simulation
  const record = storage.simulateCall(req.params.id, req.userId!);
  if (!record) {
    res.status(404).json({ success: false, error: "Lead not found" });
    return;
  }
  res.json({
    success: true,
    data: record,
    message: "AI call initiated (simulated — add Vapi API key in Settings for real calls)",
    provider: "simulated",
  });
});

// GET /api/leads/:id/calls — Get call records for a specific lead
router.get("/:id/calls", (req: Request, res: Response) => {
  const calls = storage.getCallRecordsForLead(req.params.id, req.userId);
  res.json({ success: true, data: calls });
});

export default router;
