import { randomUUID } from "crypto";
import { db } from "./db/index.js";
import { leads, callRecords } from "./db/schema.js";
import { eq, and, like, gte, lte, desc, asc, count, sql } from "drizzle-orm";
import type {
  Lead,
  CallRecord,
  DashboardStats,
  LeadStatus,
  PaginatedResponse,
} from "../shared/types.js";
import type { CreateLeadInput, UpdateLeadInput, LeadFiltersInput } from "./schema.js";

// Helper to map a DB lead row to the Lead type
function mapLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    status: row.status as LeadStatus,
    score: row.score,
    lastCalled: row.lastCalled || null,
    callResult: row.callResult || null,
    notes: row.notes,
    revenue: row.revenue,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapCallRecord(row: any): CallRecord {
  return {
    id: row.id,
    leadId: row.leadId,
    leadName: "", // filled separately
    timestamp: row.timestamp,
    duration: row.duration,
    result: row.result as CallRecord["result"],
    notes: row.notes,
    sentiment: row.sentiment as CallRecord["sentiment"],
  };
}

class DatabaseStorage {
  // ----- Leads -----

  getLeads(filters: LeadFiltersInput, userId: string): PaginatedResponse<Lead> {
    // Build raw SQL conditions for flexibility
    const conditions: string[] = ["l.user_id = ?"];
    const params: any[] = [userId];

    if (filters.status) {
      conditions.push("l.status = ?");
      params.push(filters.status);
    }

    if (filters.search) {
      const q = `%${filters.search.toLowerCase()}%`;
      conditions.push("(LOWER(l.name) LIKE ? OR LOWER(l.email) LIKE ? OR LOWER(l.company) LIKE ? OR l.phone LIKE ?)");
      params.push(q, q, q, q);
    }

    if (filters.minScore !== undefined) {
      conditions.push("l.score >= ?");
      params.push(filters.minScore);
    }

    if (filters.maxScore !== undefined) {
      conditions.push("l.score <= ?");
      params.push(filters.maxScore);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Sort
    const sortColumnMap: Record<string, string> = {
      name: "l.name",
      score: "l.score",
      createdAt: "l.created_at",
      updatedAt: "l.updated_at",
      lastCalled: "l.last_called",
    };
    const sortCol = sortColumnMap[filters.sortBy || "createdAt"] || "l.created_at";
    const sortDir = filters.sortOrder === "asc" ? "ASC" : "DESC";

    // Count
    const countResult = db.$client.prepare(`SELECT COUNT(*) as cnt FROM leads l ${whereClause}`).get(...[params]) as any;
    const total = countResult?.cnt || 0;

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const rows = db.$client.prepare(
      `SELECT l.id, l.name, l.email, l.phone, l.company, l.status, l.score, l.last_called, l.call_result, l.notes, l.revenue, l.created_at, l.updated_at
       FROM leads l ${whereClause} ORDER BY ${sortCol} ${sortDir} LIMIT ? OFFSET ?`
    ).all(...params, limit, offset) as any[];

    const data: Lead[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      company: r.company,
      status: r.status as LeadStatus,
      score: r.score,
      lastCalled: r.last_called || null,
      callResult: r.call_result || null,
      notes: r.notes,
      revenue: r.revenue,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    return { data, total, page, limit, totalPages };
  }

  getLead(id: string, userId?: string): Lead | undefined {
    const conditions = [eq(leads.id, id)];
    if (userId) conditions.push(eq(leads.userId, userId));

    const row = db.select().from(leads).where(and(...conditions)).get();
    if (!row) return undefined;
    return mapLead(row);
  }

  createLead(input: CreateLeadInput, userId: string): Lead {
    const now = new Date().toISOString();
    const id = randomUUID();
    const lead = {
      id,
      userId,
      name: input.name,
      email: input.email || "",
      phone: input.phone,
      company: input.company || "",
      status: input.status || "new",
      score: input.score ?? Math.floor(Math.random() * 60 + 30),
      lastCalled: null,
      callResult: null,
      notes: input.notes || "",
      revenue: input.revenue || 0,
      source: "manual",
      createdAt: now,
      updatedAt: now,
    };

    db.insert(leads).values(lead).run();
    return mapLead(lead);
  }

  updateLead(id: string, input: UpdateLeadInput, userId?: string): Lead | undefined {
    const conditions = [eq(leads.id, id)];
    if (userId) conditions.push(eq(leads.userId, userId));

    const existing = db.select().from(leads).where(and(...conditions)).get();
    if (!existing) return undefined;

    const updateData: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.company !== undefined) updateData.company = input.company;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.score !== undefined) updateData.score = input.score;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.revenue !== undefined) updateData.revenue = input.revenue;
    if (input.callResult !== undefined) updateData.callResult = input.callResult;

    db.update(leads).set(updateData).where(eq(leads.id, id)).run();

    return this.getLead(id);
  }

  deleteLead(id: string, userId?: string): boolean {
    const conditions = [eq(leads.id, id)];
    if (userId) conditions.push(eq(leads.userId, userId));

    const existing = db.select().from(leads).where(and(...conditions)).get();
    if (!existing) return false;

    // Delete associated call records first
    db.delete(callRecords).where(eq(callRecords.leadId, id)).run();
    db.delete(leads).where(eq(leads.id, id)).run();
    return true;
  }

  createLeadsBulk(inputs: CreateLeadInput[], userId: string): Lead[] {
    return inputs.map((input) => this.createLead(input, userId));
  }

  // ----- Calls -----

  /**
   * Start a real call (Vapi) — marks lead as calling, creates call record with vapiCallId
   */
  startCall(leadId: string, userId: string, vapiCallId: string): CallRecord | undefined {
    const lead = this.getLead(leadId, userId);
    if (!lead) return undefined;

    db.update(leads).set({
      status: "calling",
      lastCalled: new Date().toISOString(),
      callResult: "pending",
      updatedAt: new Date().toISOString(),
    }).where(eq(leads.id, leadId)).run();

    const recordId = randomUUID();
    db.insert(callRecords).values({
      id: recordId,
      leadId,
      userId,
      timestamp: new Date().toISOString(),
      duration: 0,
      result: "pending",
      notes: "AI call initiated via Vapi",
      sentiment: "neutral",
      vapiCallId,
    }).run();

    return {
      id: recordId,
      leadId,
      leadName: lead.name,
      timestamp: new Date().toISOString(),
      duration: 0,
      result: "pending",
      notes: "AI call initiated via Vapi",
      sentiment: "neutral",
    };
  }

  /**
   * Update a call record from Vapi webhook/poll
   */
  updateCallRecord(recordId: string, data: { result: string; duration: number; notes: string; sentiment: string; leadStatus: string }) {
    db.update(callRecords).set({
      result: data.result,
      duration: data.duration,
      notes: data.notes,
      sentiment: data.sentiment,
    }).where(eq(callRecords.id, recordId)).run();

    // Also update the lead
    const record = db.select().from(callRecords).where(eq(callRecords.id, recordId)).get();
    if (record) {
      db.update(leads).set({
        status: data.leadStatus,
        callResult: data.result,
        updatedAt: new Date().toISOString(),
      }).where(eq(leads.id, record.leadId)).run();
    }
  }

  simulateCall(leadId: string, userId: string): CallRecord | undefined {
    const lead = this.getLead(leadId, userId);
    if (!lead) return undefined;

    // Mark lead as calling
    db.update(leads).set({
      status: "calling",
      lastCalled: new Date().toISOString(),
      callResult: "pending",
      updatedAt: new Date().toISOString(),
    }).where(eq(leads.id, leadId)).run();

    const recordId = randomUUID();
    db.insert(callRecords).values({
      id: recordId,
      leadId,
      userId,
      timestamp: new Date().toISOString(),
      duration: 0,
      result: "pending",
      notes: "AI call initiated",
      sentiment: "neutral",
      vapiCallId: null,
    }).run();

    const record: CallRecord = {
      id: recordId,
      leadId,
      leadName: lead.name,
      timestamp: new Date().toISOString(),
      duration: 0,
      result: "pending",
      notes: "AI call initiated",
      sentiment: "neutral",
    };

    // Simulate call completion after 3-8 seconds
    const duration = Math.floor(Math.random() * 300 + 60);
    const outcomes: Array<{
      result: CallRecord["result"];
      status: Lead["status"];
      sentiment: CallRecord["sentiment"];
    }> = [
      { result: "answered", status: "contacted", sentiment: "positive" },
      { result: "answered", status: "qualified", sentiment: "positive" },
      { result: "voicemail", status: "contacted", sentiment: "neutral" },
      { result: "no_answer", status: "no_answer", sentiment: "neutral" },
      { result: "callback_scheduled", status: "qualified", sentiment: "positive" },
      { result: "converted", status: "converted", sentiment: "positive" },
    ];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    setTimeout(() => {
      db.update(leads).set({
        status: outcome.status,
        callResult: outcome.result,
        updatedAt: new Date().toISOString(),
      }).where(eq(leads.id, leadId)).run();

      db.update(callRecords).set({
        duration,
        result: outcome.result,
        sentiment: outcome.sentiment,
        notes: `AI call completed — ${outcome.result}`,
      }).where(eq(callRecords.id, recordId)).run();
    }, Math.floor(Math.random() * 5000 + 3000));

    return record;
  }

  getCallRecords(limit: number = 20, userId?: string): CallRecord[] {
    let query: string;
    const params: any[] = [];

    if (userId) {
      query = `SELECT cr.id, cr.lead_id, cr.timestamp, cr.duration, cr.result, cr.notes, cr.sentiment, l.name as lead_name
               FROM call_records cr LEFT JOIN leads l ON cr.lead_id = l.id
               WHERE cr.user_id = ? ORDER BY cr.timestamp DESC LIMIT ?`;
      params.push(userId, limit);
    } else {
      query = `SELECT cr.id, cr.lead_id, cr.timestamp, cr.duration, cr.result, cr.notes, cr.sentiment, l.name as lead_name
               FROM call_records cr LEFT JOIN leads l ON cr.lead_id = l.id
               ORDER BY cr.timestamp DESC LIMIT ?`;
      params.push(limit);
    }

    const rows = db.$client.prepare(query).all(...params) as any[];

    return rows.map((r: any) => ({
      id: r.id,
      leadId: r.lead_id,
      leadName: r.lead_name || "Unknown",
      timestamp: r.timestamp,
      duration: r.duration,
      result: r.result,
      notes: r.notes,
      sentiment: r.sentiment,
    }));
  }

  getCallRecordsForLead(leadId: string, userId?: string): CallRecord[] {
    const conditions: string[] = ["cr.lead_id = ?"];
    const params: any[] = [leadId];
    if (userId) {
      conditions.push("cr.user_id = ?");
      params.push(userId);
    }

    const whereClause = conditions.join(" AND ");
    const rows = db.$client.prepare(
      `SELECT cr.id, cr.lead_id, cr.timestamp, cr.duration, cr.result, cr.notes, cr.sentiment, l.name as lead_name
       FROM call_records cr LEFT JOIN leads l ON cr.lead_id = l.id
       WHERE ${whereClause} ORDER BY cr.timestamp DESC`
    ).all(...params) as any[];

    return rows.map((r: any) => ({
      id: r.id,
      leadId: r.lead_id,
      leadName: r.lead_name || "Unknown",
      timestamp: r.timestamp,
      duration: r.duration,
      result: r.result,
      notes: r.notes,
      sentiment: r.sentiment,
    }));
  }

  // ----- Stats -----

  getStats(userId?: string): DashboardStats {
    const userFilter = userId ? "WHERE user_id = ?" : "";
    const userParam = userId ? [userId] : [];

    const allLeads = db.$client.prepare(`SELECT status, score, revenue, created_at FROM leads ${userFilter}`).all(...userParam) as any[];
    const totalLeads = allLeads.length;

    const callFilter = userId ? "WHERE user_id = ?" : "";
    const allCalls = db.$client.prepare(`SELECT timestamp FROM call_records ${callFilter}`).all(...userParam) as any[];
    const callsMade = allCalls.length;

    const converted = allLeads.filter((l: any) => l.status === "converted").length;
    const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;
    const revenueRecovered = allLeads
      .filter((l: any) => l.status === "converted")
      .reduce((sum: number, l: any) => sum + (l.revenue || 0), 0);

    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const leadsThisWeek = allLeads.filter((l: any) => l.created_at >= oneWeekAgo).length;

    const today = new Date().toISOString().slice(0, 10);
    const callsToday = allCalls.filter((c: any) => c.timestamp.slice(0, 10) === today).length;

    const avgScore =
      totalLeads > 0
        ? Math.round(allLeads.reduce((sum: number, l: any) => sum + l.score, 0) / totalLeads)
        : 0;

    const topStatus = {} as Record<string, number>;
    for (const lead of allLeads) {
      topStatus[lead.status] = (topStatus[lead.status] || 0) + 1;
    }

    return {
      totalLeads,
      callsMade,
      conversionRate: Math.round(conversionRate * 10) / 10,
      revenueRecovered,
      leadsThisWeek,
      callsToday,
      avgScore,
      topStatus: topStatus as DashboardStats["topStatus"],
    };
  }
}

export const storage = new DatabaseStorage();
