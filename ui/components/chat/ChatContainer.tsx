"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ReportView } from "@/components/ReportView";
import { ResearchProgress } from "@/components/ResearchProgress";
import type { Message, PipelineStage, ResearchResult } from "@/lib/types";

export interface ChatTurn {
  id: string;
  userPrompt: string;
  userTimestamp?: string | number;
  result?: ResearchResult | null;
  isStreaming?: boolean;
}

interface ChatContainerProps {
  turns: ChatTurn[];
  activeStage?: PipelineStage;
  activeCompletedStages?: Set<string>;
  onNewResearch?: () => void;
  userName?: string | null;
  userImage?: string | null;
}

export function ChatContainer({
  turns,
  activeStage = "idle",
  activeCompletedStages = new Set(),
  onNewResearch,
  userName,
  userImage,
}: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, activeStage]);

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
              <ResearchProgress stage={activeStage} completedStages={activeCompletedStages} />
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
