"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Info } from "lucide-react";
import {
  PIPELINE_STEPS,
  STAGE_ORDER,
  ROTATING_STATUS_MESSAGES,
  LONG_WAIT_MESSAGES,
} from "@/lib/constants";
import type { PipelineStage } from "@/lib/types";
import { SkeletonBlock } from "@/components/SkeletonBlock";
import { cn } from "@/lib/utils";

interface ResearchProgressProps {
  stage: PipelineStage;
  completedStages: Set<string>;
}

export function ResearchProgress({ stage, completedStages }: ResearchProgressProps) {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentIndex = STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);

  // Elapsed timer tracking seconds elapsed since progress mounted
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ticker timer rotating status messages every 3.5 seconds
  useEffect(() => {
    const ticker = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % ROTATING_STATUS_MESSAGES.length);
    }, 3500);
    return () => clearInterval(ticker);
  }, []);

  // Determine current long-wait message based on elapsed seconds
  const currentLongWait = LONG_WAIT_MESSAGES.slice()
    .reverse()
    .find((item) => elapsedSeconds >= item.thresholdSeconds);

  const currentStatusMsg = ROTATING_STATUS_MESSAGES[tickerIndex];

  return (
    <div className="flex flex-col gap-10 w-full" aria-label="Research progress">
      {/* Live Region for Screen Readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Current step: ${PIPELINE_STEPS[currentIndex]?.label || "Working"}. ${currentStatusMsg}`}
      </div>

      {/* Reassuring Long Wait Notification Banner */}
      <AnimatePresence mode="wait">
        {currentLongWait && (
          <motion.div
            key={currentLongWait.thresholdSeconds}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 shadow-sm"
          >
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              {currentLongWait.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Two-Column Waiting Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
        {/* Left Column: Timeline & Rotating Status */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
              Research Timeline
            </p>

            {/* Rotating Status Ticker */}
            <div className="mt-2 h-7 flex items-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tickerIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate"
                >
                  {currentStatusMsg}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="flex flex-col gap-0" role="list">
            {PIPELINE_STEPS.map((step, index) => {
              const isDone = completedStages.has(step.id) || stage === "done";
              const isActive = !isDone && (stage === step.id || index === currentIndex);

              return (
                <motion.div
                  key={step.id}
                  role="listitem"
                  aria-current={isActive ? "step" : undefined}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.35, ease: "easeOut" }}
                  className="flex items-start gap-4 py-3.5"
                >
                  {/* Step icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100"
                      >
                        <Check className="h-3 w-3 text-white dark:text-zinc-900" strokeWidth={2.5} />
                      </motion.div>
                    ) : isActive ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-900">
                        <Loader2 className="h-3 w-3 animate-spin text-indigo-600 dark:text-indigo-400" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      </div>
                    )}
                  </div>

                  {/* Step text */}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p
                      className={cn(
                        "text-xs font-semibold leading-snug transition-colors",
                        isDone || isActive
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-400 dark:text-zinc-600",
                      )}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.2 }}
                        className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Skeleton Preview */}
        <div className="md:col-span-3 flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            Preparing Report Preview
          </p>
          <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-7 w-2/3" />
              <SkeletonBlock className="h-3.5 w-1/3" />
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <SkeletonBlock className="h-4 w-1/4" />
              <SkeletonBlock className="h-3.5 w-full" />
              <SkeletonBlock className="h-3.5 w-full" />
              <SkeletonBlock className="h-3.5 w-4/5" />
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <SkeletonBlock className="h-4 w-1/3" />
              <SkeletonBlock className="h-3.5 w-full" />
              <SkeletonBlock className="h-3.5 w-full" />
              <SkeletonBlock className="h-3.5 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
