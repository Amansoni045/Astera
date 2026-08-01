import type { ResearchResult } from "./types";

function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!envUrl) return "http://localhost:8000";
  const withProtocol = /^https?:\/\//i.test(envUrl) ? envUrl : `https://${envUrl}`;
  return withProtocol.replace(/\/+$/, "");
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

export async function researchTopic(topic: string): Promise<ResearchResult> {
  const response = await fetch(`${API_BASE}/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });

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

  return response.json() as Promise<ResearchResult>;
}

export function streamResearchTopic(
  topic: string,
  onEvent: (event: string, data: any) => void,
  onError: (errMessage: string) => void,
): () => void {
  const url = `${API_BASE}/research/stream?topic=${encodeURIComponent(topic)}`;
  const eventSource = new EventSource(url);

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
    eventSource.addEventListener(eventName, (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent(eventName, parsed);
      } catch {
        onEvent(eventName, e.data);
      }
    });
  });

  eventSource.onerror = () => {
    onError("Unable to connect to the backend research service.");
    eventSource.close();
  };

  return () => eventSource.close();
}
