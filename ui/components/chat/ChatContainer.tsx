"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ReportView } from "@/components/ReportView";
import { ResearchProgress } from "@/components/ResearchProgress";
import type { PipelineStage, ResearchResult } from "@/lib/types";

export interface ChatTurn {
  id: string;
  userPrompt: string;
  userTimestamp?: string | number;
  result?: ResearchResult | null;
  isStreaming?: boolean;
}

interface ChatContainerProps {
  turns: ChatTurn[];
  currentStage?: PipelineStage;
  activeStage?: PipelineStage;
  completedStages?: Set<string>;
  activeCompletedStages?: Set<string>;
  isStreaming?: boolean;
  onNewResearch?: () => void;
  userName?: string | null;
  userImage?: string | null;
}

export function ChatContainer({
  turns,
  currentStage,
  activeStage = "idle",
  completedStages,
  activeCompletedStages,
  onNewResearch,
  userName,
  userImage,
}: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const stageToUse = currentStage || activeStage;
  const stagesToUse = completedStages || activeCompletedStages || new Set();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, stageToUse]);

  return (
    <div className="flex w-full flex-col gap-10 pb-12">
      {turns.map((turn, index) => (
        <div key={turn.id || index} className="flex w-full flex-col gap-6">
          {/* User Turn */}
          <MessageBubble
            content={turn.userPrompt}
            timestamp={turn.userTimestamp}
            userName={userName}
            userImage={userImage}
          />

          {/* Assistant Turn: Streaming state or Completed Report */}
          {turn.isStreaming ? (
            <div className="py-4">
              <ResearchProgress stage={stageToUse} completedStages={stagesToUse} />
            </div>
          ) : turn.result ? (
            <div className="py-2">
              <ReportView result={turn.result} onNewResearch={onNewResearch || (() => {})} />
            </div>
          ) : null}
        </div>
      ))}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
