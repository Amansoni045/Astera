"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Clock, X, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SearchInput } from "@/components/SearchInput";
import { ProgressTracker } from "@/components/ProgressTracker";
import { ReportSkeleton } from "@/components/SkeletonBlock";
import { ReportView } from "@/components/ReportView";
import { useResearch } from "@/hooks/useResearch";
import { getHistory } from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function WorkspacePage() {
  const { stage, result, error, isRateLimitError, run, reset } = useResearch();
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

            {/* In-progress state */}
            {isActive && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col gap-10"
              >
                {/* Compact search bar at top */}
                <SearchInput onSubmit={handleSubmit} disabled />

                {/* Two-column layout: progress left, skeleton right */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                  <div className="md:col-span-2">
                    <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                      Working on it
                    </p>
                    <ProgressTracker stage={stage} />
                  </div>
                  <div className="md:col-span-3">
                    <ReportSkeleton />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error state */}
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

                {isRateLimitError ? (
                  /* Rate limit banner */
                  <div
                    role="alert"
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Clock
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400"
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                          AI Provider Rate Limit Reached
                        </p>
                        <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                          {error}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {lastTopic && (
                        <button
                          onClick={handleRetry}
                          className="flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Retry
                        </button>
                      )}
                      <button
                        onClick={handleNewResearch}
                        className="p-1 text-amber-500 hover:text-amber-700 focus-visible:outline-none"
                        aria-label="Dismiss error"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Generic error banner */
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-4"
                  >
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        Something went wrong
                      </p>
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-500 leading-relaxed">
                        {error}
                      </p>
                    </div>
                    <button
                      onClick={handleNewResearch}
                      className="text-red-400 hover:text-red-600 focus-visible:outline-none"
                      aria-label="Dismiss error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
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
