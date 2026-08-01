"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronRight, Trash2, PanelLeftClose, PanelLeft, Sparkles } from "lucide-react";
import { getHistory, clearHistory, groupHistoryByDate } from "@/lib/history";
import type { HistoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectEntry: (entry: HistoryEntry) => void;
  onNewResearch: () => void;
  entries: HistoryEntry[];
  setEntries: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  activeTopicId?: string;
}

export function Sidebar({
  isOpen,
  onToggle,
  onSelectEntry,
  onNewResearch,
  entries,
  setEntries,
  activeTopicId,
}: SidebarProps) {
  useEffect(() => {
    setEntries(getHistory());
    const handler = () => setEntries(getHistory());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [setEntries]);

  const handleClear = () => {
    clearHistory();
    setEntries([]);
  };

  const grouped = groupHistoryByDate(entries);
  const BUCKET_ORDER = ["Today", "Yesterday", "This week", "Earlier"];

  return (
    <>
      {/* Floating Toggle Button when Sidebar is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={onToggle}
            className={cn(
              "fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
              "border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md",
              "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
              "hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            )}
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className={cn(
              "fixed left-0 top-0 z-40 h-full w-64 flex flex-col",
              "border-r border-zinc-200/80 dark:border-zinc-800/80",
              "bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm",
            )}
            aria-label="Research history"
          >
            {/* Top Bar: Title & Toggle Close */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <button
                onClick={onNewResearch}
                className="flex items-center gap-2 text-left group focus-visible:outline-none"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs">
                  A
                </div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Astera
                </span>
              </button>

              <button
                onClick={onToggle}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-150",
                  "text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200",
                  "hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                )}
                aria-label="Close sidebar"
                title="Close sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            {/* New Research Button */}
            <div className="p-3">
              <button
                onClick={onNewResearch}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150",
                  "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
                  "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100",
                  "hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>New Research</span>
              </button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2.5 py-20 text-center px-4">
                  <Clock className="h-5 w-5 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-xs text-zinc-400 dark:text-zinc-600 leading-relaxed">
                    Your research history will appear here
                  </p>
                </div>
              ) : (
                <nav className="space-y-4 pt-1">
                  {BUCKET_ORDER.filter((b) => grouped[b]).map((bucket) => (
                    <div key={bucket}>
                      <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                        {bucket}
                      </p>
                      <ul className="space-y-0.5">
                        {grouped[bucket].map((entry) => (
                          <li key={entry.id}>
                            <button
                              onClick={() => onSelectEntry(entry)}
                              className={cn(
                                "group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors duration-150",
                                activeTopicId === entry.id
                                  ? "bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium"
                                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                              )}
                            >
                              <span className="flex-1 truncate text-xs leading-snug">
                                {entry.topic}
                              </span>
                              <ChevronRight
                                className="h-3 w-3 flex-shrink-0 text-zinc-400 dark:text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100"
                                aria-hidden="true"
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              )}
            </div>

            {/* Footer */}
            {entries.length > 0 && (
              <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 p-3">
                <button
                  onClick={handleClear}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-200/50 dark:hover:bg-zinc-900/60 hover:text-zinc-600 dark:hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Clear research history"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Clear history</span>
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
