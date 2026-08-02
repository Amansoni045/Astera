"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { cn } from "@/lib/utils";

interface ReportSectionProps {
  title: string;
  content: string;
  index: number;
  defaultOpen?: boolean;
}

export function ReportSection({
  title,
  content,
  index,
  defaultOpen = true,
}: ReportSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      aria-labelledby={`section-title-${index}`}
    >
      {/* Section header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="group flex w-full items-center justify-between gap-4 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        aria-expanded={isOpen}
      >
        <h2
          id={`section-title-${index}`}
          className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
        >
          {title}
        </h2>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 text-zinc-400 transition-transform duration-300 md:hidden",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              <MarkdownRenderer content={content} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
