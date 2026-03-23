import { z } from "zod";

export const leadStatusEnum = z.enum([
  "new",
  "contacted",
  "calling",
  "qualified",
  "converted",
  "lost",
  "no_answer",
]);

export const callResultEnum = z.enum([
  "pending",
  "answered",
  "voicemail",
  "no_answer",
  "busy",
  "callback_scheduled",
  "converted",
]);

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().default(""),
  phone: z.string().min(1, "Phone is required"),
  company: z.string().optional().default(""),
  status: leadStatusEnum.optional().default("new"),
  score: z.number().min(0).max(100).optional().default(0),
  notes: z.string().optional().default(""),
  revenue: z.number().min(0).optional().default(0),
});

export const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  company: z.string().optional(),
  status: leadStatusEnum.optional(),
  score: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  revenue: z.number().min(0).optional(),
  callResult: callResultEnum.nullable().optional(),
});

export const leadFiltersSchema = z.object({
  status: leadStatusEnum.optional(),
  search: z.string().optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxScore: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  sortBy: z
    .enum(["name", "score", "createdAt", "updatedAt", "lastCalled"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFiltersInput = z.infer<typeof leadFiltersSchema>;
