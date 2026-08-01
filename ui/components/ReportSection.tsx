"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportSectionProps {
  title: string;
  content: string;
  index: number;
  defaultOpen?: boolean;
}

/**
 * Renders a single report section with optional collapse behaviour.
 * Bullet lines are rendered as list items; paragraph text as paragraphs.
 */
export function ReportSection({
  title,
  content,
  index,
  defaultOpen = true,
}: ReportSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      aria-labelledby={`section-title-${index}`}
    >
      {/* Section header — collapsible on mobile */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="group flex w-full items-center justify-between gap-4 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
        aria-expanded={isOpen}
      >
        <h2
          id={`section-title-${index}`}
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight"
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
            <div className="mt-4 flex flex-col gap-4">
              {paragraphs.map((para, i) => {
                const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
                const isBulletList = lines.every((l) => /^[-*•]/.test(l));

                if (isBulletList) {
                  return (
                    <ul
                      key={i}
                      className="flex flex-col gap-2 pl-0"
                    >
                      {lines.map((line, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2.5 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300"
                        >
                          <span
                            className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600"
                            aria-hidden="true"
                          />
                          <span>{line.replace(/^[-*•]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p
                    key={i}
                    className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300"
                  >
                    {para}
                  </p>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
