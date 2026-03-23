import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  company: text("company").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull(),
  company: text("company").notNull().default(""),
  status: text("status").notNull().default("new"),
  score: integer("score").notNull().default(0),
  lastCalled: text("last_called"),
  callResult: text("call_result"),
  notes: text("notes").notNull().default(""),
  revenue: real("revenue").notNull().default(0),
  source: text("source").notNull().default("manual"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const callRecords = sqliteTable("call_records", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull().references(() => leads.id),
  userId: text("user_id").notNull().references(() => users.id),
  timestamp: text("timestamp").notNull(),
  duration: integer("duration").notNull().default(0),
  result: text("result").notNull(),
  notes: text("notes").notNull().default(""),
  sentiment: text("sentiment").notNull().default("neutral"),
  vapiCallId: text("vapi_call_id"),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id),
  vapiApiKey: text("vapi_api_key"),
  vapiAssistantId: text("vapi_assistant_id"),
  defaultVoice: text("default_voice").notNull().default("alloy"),
  callScript: text("call_script"),
  webhookUrl: text("webhook_url"),
});
