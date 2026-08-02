"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useId } from "react";
import { RefreshCw, BookOpen, Layers } from "lucide-react";
import { ReportSection } from "@/components/ReportSection";
import { SourceCard } from "@/components/SourceCard";
import { CriticBadge } from "@/components/CriticBadge";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { parseReport } from "@/lib/parser";
import type { ResearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReportViewProps {
  result: ResearchResult;
  onNewResearch: () => void;
}

export function ReportView({ result, onNewResearch }: ReportViewProps) {
  const [activeTab, setActiveTab] = useState<"report" | "sources">("report");
  const tabId = useId();

  const parsed = parseReport(
    result.topic,
    result.report,
    result.feedback,
    result.search_results,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Report header */}
      <header className="mb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-200/50 dark:border-indigo-800/50">
              <Layers className="h-3.5 w-3.5" />
              <span>Research Dossier</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
              {parsed.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {parsed.sections.length} research sections · {parsed.sources.length} authority sources
            </p>
          </div>
          {parsed.criticScore && (
            <CriticBadge score={parsed.criticScore} />
          )}
        </div>

        {/* Action bar */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onNewResearch}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold",
              "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
              "text-zinc-700 dark:text-zinc-300 shadow-sm",
              "transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            )}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>New Research</span>
          </button>
        </div>
      </header>

      {/* Tab nav */}
      <div
        role="tablist"
        aria-label="Report sections"
        className="mb-8 flex gap-2 border-b border-zinc-200 dark:border-zinc-800"
      >
        {(["report", "sources"] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            id={`${tabId}-tab-${tab}`}
            aria-controls={`${tabId}-panel-${tab}`}
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-2 pb-3 px-2 text-xs sm:text-sm font-semibold transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm",
            )}
          >
            {tab === "report" ? (
              <>
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>Report</span>
              </>
            ) : (
              <>
                <span>Sources</span>
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  {parsed.sources.length}
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        {activeTab === "report" ? (
          <motion.div
            key="report"
            role="tabpanel"
            id={`${tabId}-panel-report`}
            aria-labelledby={`${tabId}-tab-report`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col divide-y divide-zinc-200/80 dark:divide-zinc-800/80 space-y-6"
          >
            {parsed.sections.length > 0 ? (
              parsed.sections.map((section, i) => (
                <div key={i} className="pt-6 first:pt-0">
                  <ReportSection
                    title={section.title}
                    content={section.content}
                    index={i}
                    defaultOpen={true}
                  />
                </div>
              ))
            ) : (
              /* Markdown fallback */
              <div className="py-4">
                <MarkdownRenderer content={result.report} />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="sources"
            role="tabpanel"
            id={`${tabId}-panel-sources`}
            aria-labelledby={`${tabId}-tab-sources`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {parsed.sources.length > 0 ? (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {parsed.sources.map((source, i) => (
                  <SourceCard key={i} source={source} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <p className="text-sm text-zinc-400 dark:text-zinc-600">
                  No sources were found in this report.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
