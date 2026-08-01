"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-label="Loading report…" aria-busy="true">
      {/* Title */}
      <div className="flex flex-col gap-3">
        <SkeletonBlock className="h-8 w-3/5" />
        <SkeletonBlock className="h-4 w-1/4" />
      </div>

      {/* Section 1 */}
      <div className="flex flex-col gap-3">
        <SkeletonBlock className="h-5 w-1/3" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>

      {/* Section 2 */}
      <div className="flex flex-col gap-3">
        <SkeletonBlock className="h-5 w-2/5" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-4/5" />
        <SkeletonBlock className="h-4 w-full" />
      </div>

      {/* Section 3 */}
      <div className="flex flex-col gap-3">
        <SkeletonBlock className="h-5 w-1/4" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
    </div>
  );
}
