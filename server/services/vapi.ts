import { db } from "../db/index.js";
import { settings } from "../db/schema.js";
import { eq } from "drizzle-orm";

interface VapiCallRequest {
  phoneNumber: string;
  leadName: string;
  leadCompany: string;
  callScript?: string;
}

interface VapiCallResponse {
  id: string;
  status: string;
}

interface UserVapiSettings {
  vapiApiKey: string | null;
  vapiAssistantId: string | null;
  defaultVoice: string;
  callScript: string | null;
}

function getUserVapiSettings(userId: string): UserVapiSettings | null {
  const row = db.select().from(settings).where(eq(settings.userId, userId)).get();
  if (!row) return null;
  return {
    vapiApiKey: row.vapiApiKey,
    vapiAssistantId: row.vapiAssistantId,
    defaultVoice: row.defaultVoice,
    callScript: row.callScript,
  };
}

/**
 * Check if user has Vapi configured
 */
export function isVapiConfigured(userId: string): boolean {
  const s = getUserVapiSettings(userId);
  return !!(s?.vapiApiKey && s.vapiApiKey.length > 10);
}

/**
 * Initiate a real Vapi call
 * Docs: https://docs.vapi.ai/api-reference/calls/create-call
 */
export async function createVapiCall(
  userId: string,
  request: VapiCallRequest,
): Promise<VapiCallResponse> {
  const s = getUserVapiSettings(userId);
  if (!s?.vapiApiKey) {
    throw new Error("Vapi API key not configured. Go to Settings to add it.");
  }

  // Build the call script with placeholders replaced
  let script = s.callScript || getDefaultScript();
  script = script
    .replace(/\{name\}/g, request.leadName)
    .replace(/\{company\}/g, request.leadCompany);

  // Build call payload
  const payload: Record<string, unknown> = {
    phoneNumberId: undefined, // User needs to set up a phone number in Vapi dashboard
    customer: {
      number: request.phoneNumber,
      name: request.leadName,
    },
  };

  // If they have an assistant ID, use it. Otherwise, create an inline assistant.
  if (s.vapiAssistantId) {
    payload.assistantId = s.vapiAssistantId;
    payload.assistantOverrides = {
      firstMessage: script,
      voice: {
        provider: "openai",
        voiceId: s.defaultVoice,
      },
    };
  } else {
    // Inline assistant configuration
    payload.assistant = {
      firstMessage: script,
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional and friendly AI sales agent for a company. Your goal is to reconnect with leads and gauge their interest. Be conversational, not pushy. The lead's name is ${request.leadName} from ${request.leadCompany}. ${script}`,
          },
        ],
      },
      voice: {
        provider: "openai",
        voiceId: s.defaultVoice,
      },
      endCallFunctionEnabled: true,
      endCallMessage: "Thank you for your time. Have a great day!",
    };
  }

  const response = await fetch("https://api.vapi.ai/call/phone", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${s.vapiApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMsg = `Vapi API error (${response.status})`;
    try {
      const parsed = JSON.parse(errorBody);
      errorMsg = parsed.message || parsed.error || errorMsg;
    } catch {
      // use default
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return {
    id: data.id,
    status: data.status || "queued",
  };
}

/**
 * Handle Vapi webhook callback
 * Docs: https://docs.vapi.ai/api-reference/calls/get-call
 */
export async function getVapiCallStatus(
  userId: string,
  callId: string,
): Promise<{
  status: string;
  duration: number;
  endedReason: string;
  transcript: string;
  summary: string;
}> {
  const s = getUserVapiSettings(userId);
  if (!s?.vapiApiKey) {
    throw new Error("Vapi API key not configured");
  }

  const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
    headers: { Authorization: `Bearer ${s.vapiApiKey}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to get call status: ${response.status}`);
  }

  const data = await response.json();
  return {
    status: data.status || "unknown",
    duration: Math.round((data.costs?.totalDurationSeconds || 0)),
    endedReason: data.endedReason || "",
    transcript: data.transcript || "",
    summary: data.summary || "",
  };
}

/**
 * Map Vapi call status to our internal statuses
 */
export function mapVapiStatusToResult(vapiStatus: string, endedReason: string): {
  callResult: string;
  leadStatus: string;
  sentiment: string;
} {
  if (vapiStatus === "ended" && endedReason === "customer-did-not-answer") {
    return { callResult: "no_answer", leadStatus: "no_answer", sentiment: "neutral" };
  }
  if (vapiStatus === "ended" && endedReason === "voicemail") {
    return { callResult: "voicemail", leadStatus: "contacted", sentiment: "neutral" };
  }
  if (vapiStatus === "ended" && endedReason === "customer-busy") {
    return { callResult: "busy", leadStatus: "contacted", sentiment: "neutral" };
  }
  if (vapiStatus === "ended") {
    return { callResult: "answered", leadStatus: "contacted", sentiment: "positive" };
  }
  if (vapiStatus === "queued" || vapiStatus === "ringing" || vapiStatus === "in-progress") {
    return { callResult: "pending", leadStatus: "calling", sentiment: "neutral" };
  }
  return { callResult: "no_answer", leadStatus: "no_answer", sentiment: "neutral" };
}

function getDefaultScript(): string {
  return "Hi {name}, this is a follow-up call regarding your previous inquiry. I wanted to check in and see if you have any questions or if there's anything we can help you with. Do you have a moment to chat?";
}
