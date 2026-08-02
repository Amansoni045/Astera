import type { ResearchResult } from "./types";

function getApiBase(): string {
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (envUrl) {
      const withProtocol = /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
      return withProtocol.replace(/\/+$/, "");
    }
  }
  return process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") || "http://localhost:8000";
}

const API_BASE = getApiBase();

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function researchTopic(topic: string, timeoutMs = 60000): Promise<ResearchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const raw = await response.text().catch(() => "Unknown error");
      let detail = raw;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && "detail" in parsed) {
          detail = typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail);
        }
      } catch {
        // Not JSON, use raw text
      }
      throw new ApiError(detail, response.status);
    }

    return (await response.json()) as ResearchResult;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    throw err;
  }
}

export function streamResearchTopic(
  topic: string,
  onEvent: (event: string, data: any) => void,
  onError: (errMessage: string) => void,
): () => void {
  const url = `${API_BASE}/research/stream?topic=${encodeURIComponent(topic)}`;
  let eventSource: EventSource | null = new EventSource(url);
  let isFinished = false;

  const events = [
    "search_started",
    "search_completed",
    "reader_started",
    "reader_completed",
    "writer_started",
    "writer_completed",
    "critic_started",
    "critic_completed",
    "finished",
    "error",
  ];

  events.forEach((eventName) => {
    eventSource?.addEventListener(eventName, (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        if (eventName === "finished") {
          isFinished = true;
        }
        onEvent(eventName, parsed);
        if (eventName === "finished" && eventSource) {
          eventSource.close();
          eventSource = null;
        }
      } catch {
        if (eventName === "finished") {
          isFinished = true;
        }
        onEvent(eventName, e.data);
        if (eventName === "finished" && eventSource) {
          eventSource.close();
          eventSource = null;
        }
      }
    });
  });

  eventSource.onerror = () => {
    // Only fire error if stream closed unexpectedly before finished event
    if (!isFinished && eventSource) {
      onError("Unable to connect to the backend research service. Please verify server status.");
      eventSource.close();
      eventSource = null;
    }
  };

  return () => {
    isFinished = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
