"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SearchInput } from "@/components/SearchInput";
import { ResearchProgress } from "@/components/ResearchProgress";
import { ReportView } from "@/components/ReportView";
import { useResearch } from "@/hooks/useResearch";
import { getHistory } from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function WorkspacePage() {
  const { stage, completedStages, result, error, run, reset } = useResearch();
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [lastTopic, setLastTopic] = useState("");

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const isIdle = stage === "idle";
  const isActive = !isIdle && stage !== "done" && stage !== "error";
  const isDone = stage === "done";
  const isError = stage === "error";

  const handleSubmit = useCallback(
    (topic: string) => {
      setLastTopic(topic);
      setActiveHistoryId(undefined);
      setViewingHistory(false);
      setHistoricalResult(null);
      run(topic);
    },
    [run],
  );

  const [historicalResult, setHistoricalResult] = useState<HistoryEntry["result"] | null>(null);
  const [viewingHistory, setViewingHistory] = useState(false);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    reset();
    setActiveHistoryId(entry.id);
    setHistoricalResult(entry.result);
    setViewingHistory(true);
  }, [reset]);

  const handleNewResearch = useCallback(() => {
    reset();
    setViewingHistory(false);
    setHistoricalResult(null);
    setActiveHistoryId(undefined);
  }, [reset]);

  const handleRetry = useCallback(() => {
    if (lastTopic) {
      handleSubmit(lastTopic);
    }
  }, [handleSubmit, lastTopic]);

  const showReport = isDone && result;
  const showHistory = viewingHistory && historicalResult;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onSelectEntry={handleHistorySelect}
        onNewResearch={handleNewResearch}
        entries={entries}
        setEntries={setEntries}
        activeTopicId={activeHistoryId}
      />

      {/* Main workspace */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 ease-in-out",
          sidebarOpen ? "pl-0 md:pl-64" : "pl-0",
        )}
        id="main-content"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Idle / home state */}
          <AnimatePresence mode="wait">
            {isIdle && !showHistory && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center justify-center min-h-[60vh] gap-12"
              >
                <div className="flex flex-col items-center gap-4 text-center max-w-lg">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Research anything.
                  </h1>
                  <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Ask a question and Astera will search the web, read the sources, and write you a clear, structured report.
                  </p>
                </div>
                <div className="w-full max-w-xl">
                  <SearchInput onSubmit={handleSubmit} autoFocus />
                  <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-600">
                    Press <kbd className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">Enter</kbd> to start
                  </p>
                </div>
              </motion.div>
            )}

            {/* In-progress state using ResearchProgress component with real SSE events */}
            {isActive && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-10"
              >
                <SearchInput onSubmit={handleSubmit} disabled />
                <ResearchProgress stage={stage} completedStages={completedStages} />
              </motion.div>
            )}

            {/* Error state — natural human language with Retry button */}
            {isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-8"
              >
                <SearchInput onSubmit={handleSubmit} />

                <div
                  role="alert"
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500 dark:text-zinc-400"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        We couldn't complete this research right now.
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Please try again in a few moments.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {lastTopic && (
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Try again</span>
                      </button>
                    )}
                    <button
                      onClick={handleNewResearch}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus-visible:outline-none rounded-lg"
                      aria-label="Dismiss error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Report state (live) */}
            {showReport && !showHistory && (
              <motion.div
                key="report"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-8"
              >
                <SearchInput onSubmit={handleSubmit} />
                <ReportView result={result} onNewResearch={handleNewResearch} />
              </motion.div>
            )}

            {/* History report */}
            {showHistory && historicalResult && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-8"
              >
                <SearchInput onSubmit={handleSubmit} />
                <ReportView result={historicalResult} onNewResearch={handleNewResearch} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
