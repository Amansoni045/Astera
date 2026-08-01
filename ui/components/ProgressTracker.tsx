"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { PIPELINE_STEPS, STAGE_ORDER } from "@/lib/constants";
import type { PipelineStage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  stage: PipelineStage;
}

export function ProgressTracker({ stage }: ProgressTrackerProps) {
  const currentIndex = STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]);

  return (
    <div className="flex flex-col gap-0" role="list" aria-label="Research progress">
      {PIPELINE_STEPS.map((step, index) => {
        const isDone = index < currentIndex || stage === "done";
        const isActive = index === currentIndex && stage !== "done";

        return (
          <motion.div
            key={step.id}
            role="listitem"
            aria-current={isActive ? "step" : undefined}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12, duration: 0.4, ease: "easeOut" }}
            className="flex items-start gap-4 py-4"
          >
            {/* Step indicator */}
            <div className="mt-0.5 flex-shrink-0">
              {isDone ? (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100"
                >
                  <Check className="h-3.5 w-3.5 text-white dark:text-zinc-900" strokeWidth={2.5} />
                </motion.div>
              ) : isActive ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
                </div>
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                </div>
              )}
            </div>

            {/* Step content */}
            <div className="flex flex-col gap-0.5 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium leading-snug transition-colors",
                  isDone
                    ? "text-zinc-900 dark:text-zinc-100"
                    : isActive
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
                  transition={{ duration: 0.25 }}
                  className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"
                >
                  {step.description}
                </motion.p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
