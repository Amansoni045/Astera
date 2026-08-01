"use client";

import { useCallback, useRef, useState } from "react";
import { streamResearchTopic } from "@/lib/api";
import { addHistoryEntry } from "@/lib/history";
import type { PipelineStage, ResearchResult } from "@/lib/types";

interface UseResearchReturn {
  stage: PipelineStage;
  completedStages: Set<string>;
  result: ResearchResult | null;
  error: string | null;
  run: (topic: string) => void;
  reset: () => void;
}

export function useResearch(): UseResearchReturn {
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeStreamRef = useRef<(() => void) | null>(null);

  const cleanupStream = () => {
    if (closeStreamRef.current) {
      closeStreamRef.current();
      closeStreamRef.current = null;
    }
  };

  const reset = useCallback(() => {
    cleanupStream();
    setStage("idle");
    setCompletedStages(new Set());
    setResult(null);
    setError(null);
  }, []);

  const run = useCallback(async (topic: string) => {
    cleanupStream();
    setStage("searching");
    setCompletedStages(new Set());
    setResult(null);
    setError(null);

    const closeStream = streamResearchTopic(
      topic,
      (eventName, data) => {
        switch (eventName) {
          case "search_started":
            setStage("searching");
            break;
          case "search_completed":
            setCompletedStages((prev) => new Set([...prev, "searching"]));
            break;
          case "reader_started":
            setStage("reading");
            break;
          case "reader_completed":
            setCompletedStages((prev) => new Set([...prev, "reading"]));
            break;
          case "writer_started":
            setStage("writing");
            break;
          case "writer_completed":
            setCompletedStages((prev) => new Set([...prev, "writing"]));
            break;
          case "critic_started":
            setStage("checking");
            break;
          case "critic_completed":
            setCompletedStages((prev) => new Set([...prev, "checking"]));
            break;
          case "finished":
            cleanupStream();
            setCompletedStages(new Set(["searching", "reading", "writing", "checking"]));
            setStage("done");
            setResult(data as ResearchResult);
            addHistoryEntry({
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              topic,
              timestamp: Date.now(),
              result: data as ResearchResult,
            });
            break;
          case "error":
            cleanupStream();
            setStage("error");
            setError("We couldn't complete this research right now. Please try again in a few moments.");
            break;
        }
      },
      (errMsg) => {
        cleanupStream();
        setStage("error");
        setError(errMsg || "We couldn't complete this research right now. Please try again in a few moments.");
      },
    );

    closeStreamRef.current = closeStream;
  }, []);

  return { stage, completedStages, result, error, run, reset };
}
