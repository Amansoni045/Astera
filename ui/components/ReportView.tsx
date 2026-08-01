"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useId } from "react";
import { RefreshCw, BookOpen } from "lucide-react";
import { ReportSection } from "@/components/ReportSection";
import { SourceCard } from "@/components/SourceCard";
import { CriticBadge } from "@/components/CriticBadge";
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
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
              {parsed.title}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              {parsed.sections.length} sections · {parsed.sources.length} sources
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
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              "border border-zinc-200 dark:border-zinc-800",
              "text-zinc-600 dark:text-zinc-400",
              "transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
            )}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            New research
          </button>
        </div>
      </header>

      {/* Tab nav */}
      <div
        role="tablist"
        aria-label="Report sections"
        className="mb-8 flex gap-1 border-b border-zinc-200 dark:border-zinc-800"
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
              "flex items-center gap-2 pb-3 px-1 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab
                ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm",
            )}
          >
            {tab === "report" ? (
              <>
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Report
              </>
            ) : (
              <>
                Sources
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
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
            className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800"
          >
            {parsed.sections.length > 0 ? (
              parsed.sections.map((section, i) => (
                <div key={i} className="py-6 first:pt-0">
                  <ReportSection
                    title={section.title}
                    content={section.content}
                    index={i}
                    defaultOpen={true}
                  />
                </div>
              ))
            ) : (
              /* Fallback: render raw text if parser finds no sections */
              <div className="py-4">
                <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                  {result.report}
                </p>
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
