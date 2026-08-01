"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CriticBadgeProps {
  score: string;
}

export function CriticBadge({ score }: CriticBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
        "border border-zinc-200 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900",
      )}
      title="Quality assessment based on source coverage and depth"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" aria-hidden="true" />
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Quality score{" "}
        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{score}</span>
      </span>
    </motion.div>
  );
}
