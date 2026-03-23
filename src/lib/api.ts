import type {
  Lead,
  CallRecord,
  DashboardStats,
  PaginatedResponse,
  LeadFilters,
} from "../../shared/types";
import { getAuthToken } from "./auth";

const API_BASE = "/api";

async function fetchApi<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      ...headers,
      ...options?.headers,
    },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `API error: ${res.status}`);
  }
  return json;
}

// Leads
export async function getLeads(
  filters?: LeadFilters,
): Promise<PaginatedResponse<Lead> & { success: boolean }> {
  const params = new URLSearchParams();
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    }
  }
  const query = params.toString();
  return fetchApi(`/leads${query ? `?${query}` : ""}`);
}

export async function getLead(id: string): Promise<{ success: boolean; data: Lead }> {
  return fetchApi(`/leads/${id}`);
}

export async function updateLead(
  id: string,
  data: Partial<Lead>,
): Promise<{ success: boolean; data: Lead }> {
  return fetchApi(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteLead(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return fetchApi(`/leads/${id}`, { method: "DELETE" });
}

export async function uploadLeadsCsv(
  csv: string,
): Promise<{ success: boolean; data: Lead[]; message: string }> {
  return fetchApi("/leads/upload", {
    method: "POST",
    body: JSON.stringify({ csv }),
  });
}

export async function triggerCall(
  leadId: string,
): Promise<{ success: boolean; data: CallRecord; message: string }> {
  return fetchApi(`/leads/${leadId}/call`, { method: "POST" });
}

export async function getLeadCalls(
  leadId: string,
): Promise<{ success: boolean; data: CallRecord[] }> {
  return fetchApi(`/leads/${leadId}/calls`);
}

// Stats
export async function getStats(): Promise<{ success: boolean; data: DashboardStats }> {
  return fetchApi("/stats");
}

// Calls
export async function getCalls(
  limit?: number,
): Promise<{ success: boolean; data: CallRecord[] }> {
  const query = limit ? `?limit=${limit}` : "";
  return fetchApi(`/calls${query}`);
}

// Settings
export interface UserSettings {
  vapiApiKey: string;
  vapiAssistantId: string;
  defaultVoice: string;
  callScript: string;
  webhookUrl: string;
}

export async function getSettings(): Promise<{ success: boolean; data: UserSettings }> {
  return fetchApi("/settings");
}

export async function updateSettings(
  data: Partial<UserSettings>,
): Promise<{ success: boolean; data: UserSettings }> {
  return fetchApi("/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
