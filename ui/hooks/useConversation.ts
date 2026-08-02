"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { streamResearchTopic } from "@/lib/api";
import { getHistory, addHistoryEntry, clearHistory } from "@/lib/history";
import type {
  ConversationSummary,
  FullConversation,
  HistoryEntry,
  PipelineStage,
  ResearchResult,
} from "@/lib/types";
import type { ChatTurn } from "@/components/chat/ChatContainer";

export function useConversation() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user?.id);

  // Authenticated state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [turns, setTurns] = useState<ChatTurn[]>([]);

  // Anonymous / Local state
  const [localEntries, setLocalEntries] = useState<HistoryEntry[]>([]);
  const [activeLocalId, setActiveLocalId] = useState<string | undefined>();

  // Active Research Streaming state
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations for authenticated user
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // Silently handle fetch error
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setLocalEntries(getHistory());
    }
  }, [isAuthenticated, fetchConversations]);

  // Load a full conversation from server
  const loadConversation = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch(`/api/conversations/${id}`);
        if (res.ok) {
          const full: FullConversation = await res.json();
          setActiveConversationId(full.id);
          setActiveLocalId(undefined);

          // Group messages into turns
          const loadedTurns: ChatTurn[] = [];
          for (let i = 0; i < full.messages.length; i++) {
            const msg = full.messages[i];
            if (msg.role === "user") {
              const assistantMsg = full.messages[i + 1];
              const resultData: ResearchResult | null = assistantMsg?.researchSession
                ? {
                    topic: assistantMsg.researchSession.topic,
                    search_results: assistantMsg.researchSession.searchResults,
                    scraped_content: assistantMsg.researchSession.scrapedContent,
                    report: assistantMsg.researchSession.report,
                    feedback: assistantMsg.researchSession.feedback,
                  }
                : null;

              loadedTurns.push({
                id: msg.id,
                userPrompt: msg.content,
                userTimestamp: msg.createdAt,
                result: resultData,
              });
            }
          }
          setTurns(loadedTurns);
          setStage("done");
        }
      } catch {
        setError("Failed to load conversation history.");
      }
    },
    [isAuthenticated],
  );

  // Select anonymous local history entry
  const selectLocalEntry = useCallback((entry: HistoryEntry) => {
    setActiveLocalId(entry.id);
    setActiveConversationId(undefined);
    setTurns([
      {
        id: entry.id,
        userPrompt: entry.topic,
        userTimestamp: entry.timestamp,
        result: entry.result,
      },
    ]);
    setStage("done");
  }, []);

  // Reset to New Research view
  const newResearch = useCallback(() => {
    setActiveConversationId(undefined);
    setActiveLocalId(undefined);
    setTurns([]);
    setStage("idle");
    setCompletedStages(new Set());
    setError(null);
  }, []);

  // Run research for a prompt (either brand new conversation or follow-up)
  const executeResearchPrompt = useCallback(
    async (prompt: string) => {
      setError(null);
      setStage("searching");
      setCompletedStages(new Set());

      const turnId = `turn-${Date.now()}`;
      const newTurn: ChatTurn = {
        id: turnId,
        userPrompt: prompt,
        userTimestamp: Date.now(),
        isStreaming: true,
      };

      setTurns((prev) => [...prev, newTurn]);

      const closeStream = streamResearchTopic(
        prompt,
        async (eventName, data) => {
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
            case "finished": {
              setCompletedStages(new Set(["searching", "reading", "writing", "checking"]));
              setStage("done");

              const resultPayload = data as ResearchResult;

              // Update active turn in state
              setTurns((prev) =>
                prev.map((t) =>
                  t.id === turnId
                    ? { ...t, result: resultPayload, isStreaming: false }
                    : t,
                ),
              );

              // Auto-save: Authenticated vs Anonymous
              if (isAuthenticated) {
                try {
                  if (activeConversationId) {
                    // Follow-up prompt in existing conversation
                    await fetch(`/api/conversations/${activeConversationId}/messages`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt, result: resultPayload }),
                    });
                  } else {
                    // Brand new conversation
                    const res = await fetch("/api/conversations", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ prompt, result: resultPayload }),
                    });
                    if (res.ok) {
                      const created: FullConversation = await res.json();
                      setActiveConversationId(created.id);
                    }
                  }
                  fetchConversations();
                } catch {
                  // Fallback
                }
              } else {
                // Anonymous: local storage save
                const entry: HistoryEntry = {
                  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  topic: prompt,
                  timestamp: Date.now(),
                  result: resultPayload,
                };
                addHistoryEntry(entry);
                setLocalEntries(getHistory());
              }
              break;
            }
            case "error":
              setStage("error");
              setError("We couldn't complete this research right now. Please try again in a few moments.");
              setTurns((prev) => prev.filter((t) => t.id !== turnId));
              break;
          }
        },
        (errMsg) => {
          setStage("error");
          setError(errMsg || "We couldn't complete this research right now.");
          setTurns((prev) => prev.filter((t) => t.id !== turnId));
        },
      );
    },
    [activeConversationId, isAuthenticated, fetchConversations],
  );

  // Rename conversation
  const renameConversation = useCallback(
    async (id: string, newTitle: string) => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
        if (res.ok) {
          fetchConversations();
        }
      } catch {
        // Silently handle error
      }
    },
    [isAuthenticated, fetchConversations],
  );

  // Pin conversation
  const pinConversation = useCallback(
    async (id: string, isPinned: boolean) => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinned }),
        });
        if (res.ok) {
          fetchConversations();
        }
      } catch {
        // Silently handle error
      }
    },
    [isAuthenticated, fetchConversations],
  );

  // Archive conversation
  const archiveConversation = useCallback(
    async (id: string, isArchived: boolean) => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isArchived }),
        });
        if (res.ok) {
          fetchConversations();
        }
      } catch {
        // Silently handle error
      }
    },
    [isAuthenticated, fetchConversations],
  );

  // Delete conversation
  const deleteConversation = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          if (activeConversationId === id) {
            newResearch();
          }
          fetchConversations();
        }
      } catch {
        // Silently handle error
      }
    },
    [isAuthenticated, activeConversationId, newResearch, fetchConversations],
  );

  const clearLocal = useCallback(() => {
    clearHistory();
    setLocalEntries([]);
    newResearch();
  }, [newResearch]);

  return {
    isAuthenticated,
    conversations,
    localEntries,
    activeConversationId,
    activeLocalId,
    turns,
    stage,
    completedStages,
    error,
    newResearch,
    loadConversation,
    selectLocalEntry,
    executeResearchPrompt,
    renameConversation,
    pinConversation,
    archiveConversation,
    deleteConversation,
    clearLocal,
  };
}
