// Shared types between frontend and backend

export type LeadStatus =
  | "new"
  | "contacted"
  | "calling"
  | "qualified"
  | "converted"
  | "lost"
  | "no_answer";

export type CallResult =
  | "pending"
  | "answered"
  | "voicemail"
  | "no_answer"
  | "busy"
  | "callback_scheduled"
  | "converted";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  score: number; // 0-100 AI lead score
  lastCalled: string | null; // ISO date string
  callResult: CallResult | null;
  notes: string;
  revenue: number; // potential revenue
  createdAt: string;
  updatedAt: string;
}

export interface CallRecord {
  id: string;
  leadId: string;
  leadName: string;
  timestamp: string;
  duration: number; // seconds
  result: CallResult;
  notes: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface DashboardStats {
  totalLeads: number;
  callsMade: number;
  conversionRate: number;
  revenueRecovered: number;
  leadsThisWeek: number;
  callsToday: number;
  avgScore: number;
  topStatus: Record<LeadStatus, number>;
}

export interface LeadFilters {
  status?: LeadStatus;
  search?: string;
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "score" | "createdAt" | "updatedAt" | "lastCalled";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
