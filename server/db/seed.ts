import { randomUUID, createHash } from "crypto";
import { db } from "./index.js";
import { users, leads, callRecords } from "./schema.js";
import { eq, count } from "drizzle-orm";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "spero-salt").digest("hex");
}

export async function seedDatabase(): Promise<void> {
  // Check if users table is empty
  const userCount = db.select({ count: count() }).from(users).get();
  if (userCount && userCount.count > 0) {
    console.log("📦 Database already seeded, skipping.");
    return;
  }

  console.log("🌱 Seeding database...");

  const demoUserId = randomUUID();
  const now = new Date().toISOString();

  // Insert demo user
  db.insert(users).values({
    id: demoUserId,
    email: "demo@spero.ai",
    name: "Demo User",
    passwordHash: hashPassword("demo123"),
    company: "Spero AI",
    createdAt: now,
  }).run();

  // Seed leads
  const seedLeadData = [
    {
      name: "Sarah Johnson",
      email: "sarah.j@techcorp.com",
      phone: "+1 (555) 234-5678",
      company: "TechCorp Industries",
      status: "qualified",
      score: 87,
      lastCalled: new Date(Date.now() - 2 * 3600000).toISOString(),
      callResult: "answered",
      notes: "Interested in premium plan. Follow up Thursday.",
      revenue: 15000,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      name: "Marcus Chen",
      email: "mchen@innovate.io",
      phone: "+1 (555) 876-5432",
      company: "Innovate.io",
      status: "new",
      score: 72,
      lastCalled: null,
      callResult: null,
      notes: "Inbound from website form",
      revenue: 8500,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      name: "Emily Rodriguez",
      email: "emily.r@globalretail.com",
      phone: "+1 (555) 345-6789",
      company: "Global Retail Co",
      status: "contacted",
      score: 65,
      lastCalled: new Date(Date.now() - 24 * 3600000).toISOString(),
      callResult: "voicemail",
      notes: "Left voicemail. Will try again tomorrow.",
      revenue: 22000,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      name: "David Park",
      email: "dpark@nexgen.dev",
      phone: "+1 (555) 567-8901",
      company: "NexGen Development",
      status: "converted",
      score: 95,
      lastCalled: new Date(Date.now() - 48 * 3600000).toISOString(),
      callResult: "converted",
      notes: "Signed annual contract. $45k ARR.",
      revenue: 45000,
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      name: "Lisa Thompson",
      email: "lthompson@bluewave.co",
      phone: "+1 (555) 678-9012",
      company: "BlueWave Solutions",
      status: "lost",
      score: 34,
      lastCalled: new Date(Date.now() - 72 * 3600000).toISOString(),
      callResult: "no_answer",
      notes: "No response after 3 attempts. Marked cold.",
      revenue: 12000,
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    },
    {
      name: "James Wilson",
      email: "jwilson@enterprise.net",
      phone: "+1 (555) 789-0123",
      company: "Enterprise Networks",
      status: "calling",
      score: 81,
      lastCalled: new Date(Date.now() - 30 * 60000).toISOString(),
      callResult: "pending",
      notes: "AI call in progress",
      revenue: 32000,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      name: "Anna Kowalski",
      email: "anna.k@finserv.com",
      phone: "+1 (555) 890-1234",
      company: "FinServ Group",
      status: "qualified",
      score: 91,
      lastCalled: new Date(Date.now() - 6 * 3600000).toISOString(),
      callResult: "callback_scheduled",
      notes: "Callback scheduled for Friday 2pm. Very interested.",
      revenue: 55000,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
    {
      name: "Robert Martinez",
      email: "rmartinez@cloudops.io",
      phone: "+1 (555) 901-2345",
      company: "CloudOps Inc",
      status: "contacted",
      score: 58,
      lastCalled: new Date(Date.now() - 12 * 3600000).toISOString(),
      callResult: "busy",
      notes: "Line was busy. Retry scheduled.",
      revenue: 18000,
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ];

  const leadIds: string[] = [];
  for (const lead of seedLeadData) {
    const id = randomUUID();
    leadIds.push(id);
    db.insert(leads).values({
      id,
      userId: demoUserId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: lead.status,
      score: lead.score,
      lastCalled: lead.lastCalled,
      callResult: lead.callResult,
      notes: lead.notes,
      revenue: lead.revenue,
      source: "manual",
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }).run();
  }

  // Seed call records
  const seedCallData = [
    {
      leadIdx: 0,
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      duration: 245,
      result: "answered",
      notes: "Discussed pricing options. Very engaged.",
      sentiment: "positive",
    },
    {
      leadIdx: 2,
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      duration: 30,
      result: "voicemail",
      notes: "Left detailed voicemail about services.",
      sentiment: "neutral",
    },
    {
      leadIdx: 3,
      timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
      duration: 480,
      result: "converted",
      notes: "Closed the deal! Annual contract signed.",
      sentiment: "positive",
    },
    {
      leadIdx: 5,
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      duration: 0,
      result: "pending",
      notes: "AI call initiated",
      sentiment: "neutral",
    },
    {
      leadIdx: 6,
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      duration: 320,
      result: "callback_scheduled",
      notes: "Great conversation. Callback booked for Friday.",
      sentiment: "positive",
    },
    {
      leadIdx: 7,
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      duration: 5,
      result: "busy",
      notes: "Line busy — auto-retry scheduled.",
      sentiment: "neutral",
    },
  ];

  for (const call of seedCallData) {
    db.insert(callRecords).values({
      id: randomUUID(),
      leadId: leadIds[call.leadIdx],
      userId: demoUserId,
      timestamp: call.timestamp,
      duration: call.duration,
      result: call.result,
      notes: call.notes,
      sentiment: call.sentiment,
      vapiCallId: null,
    }).run();
  }

  console.log("✅ Database seeded with demo user (demo@spero.ai / demo123) and 8 leads.");
}
