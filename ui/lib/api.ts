import type { ResearchResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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
