"use client";

import { useCallback, useRef, useState } from "react";
import { researchTopic, ApiError } from "@/lib/api";
import { addHistoryEntry } from "@/lib/history";
import { STAGE_ORDER } from "@/lib/constants";
import type { PipelineStage, ResearchResult } from "@/lib/types";

// Approximate timing for each pipeline stage based on observed backend durations.
const STAGE_DURATIONS_MS: Record<string, number> = {
  searching: 8_000,
  reading: 12_000,
  writing: 18_000,
  checking: 8_000,
};

interface UseResearchReturn {
  stage: PipelineStage;
  result: ResearchResult | null;
  error: string | null;
  isRateLimitError: boolean;
  run: (topic: string) => Promise<void>;
  reset: () => void;
}

export function useResearch(): UseResearchReturn {
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimitError, setIsRateLimitError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const reset = useCallback(() => {
    clearTimer();
    setStage("idle");
    setResult(null);
    setError(null);
    setIsRateLimitError(false);
  }, []);

  const run = useCallback(async (topic: string) => {
    clearTimer();
    setResult(null);
    setError(null);
    setIsRateLimitError(false);

    // Simulate sequential stage progression while the real request runs.
    let stageIndex = 0;
    const advanceStage = () => {
      const currentStage = STAGE_ORDER[stageIndex];
      setStage(currentStage as PipelineStage);
      stageIndex++;

      if (stageIndex < STAGE_ORDER.length) {
        const duration = STAGE_DURATIONS_MS[currentStage] ?? 10_000;
        timerRef.current = setTimeout(advanceStage, duration);
      }
    };
    advanceStage();

    try {
      const data = await researchTopic(topic);
      clearTimer();
      setStage("done");
      setResult(data);

      addHistoryEntry({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        topic,
        timestamp: Date.now(),
        result: data,
      });
    } catch (err) {
      clearTimer();
      setStage("error");

      if (err instanceof ApiError) {
        const msg = err.message || "";
        const is422 = err.status === 422;
        const isRateLimit =
          msg.includes("429") ||
          msg.toLowerCase().includes("rate limit") ||
          msg.toLowerCase().includes("tpm") ||
          msg.toLowerCase().includes("too many requests");

        if (isRateLimit) {
          setIsRateLimitError(true);
          setError(
            "Rate limit reached on AI Provider (Groq Tokens-Per-Minute limit). Please wait 20–30 seconds and try again.",
          );
        } else if (is422) {
          setError("Please enter a valid research topic.");
        } else {
          // Provide clean detail without confusing technical prefixes
          const cleanDetail = msg
            .replace(/^Research pipeline failed:\s*/i, "")
            .replace(/^Error code:\s*\d+\s*-\s*/i, "");
          setError(cleanDetail || "Something went wrong while researching. Please try again.");
        }
      } else {
        setError(
          "Unable to connect to backend server. Make sure FastAPI (uvicorn api:app) is running on port 8000.",
        );
      }
    }
  }, []);

  return { stage, result, error, isRateLimitError, run, reset };
}
