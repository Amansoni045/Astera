"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, ChevronRight, Sparkles } from "lucide-react";
import type { ConversationSummary, HistoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationSummary[];
  localEntries: HistoryEntry[];
  onSelectConversation: (id: string) => void;
  onSelectLocalEntry: (entry: HistoryEntry) => void;
  isAuthenticated: boolean;
}

export function SearchModal({
  isOpen,
  onClose,
  conversations,
  localEntries,
  onSelectConversation,
  onSelectLocalEntry,
  isAuthenticated,
}: SearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredConversations = isAuthenticated
    ? conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          (c.lastMessagePrompt && c.lastMessagePrompt.toLowerCase().includes(query.toLowerCase())),
      )
    : [];

  const filteredLocal = !isAuthenticated
    ? localEntries.filter((e) => e.topic.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "relative w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl border flex flex-col max-h-[70vh]",
            "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
          )}
        >
          {/* Header Search Field */}
          <div className="flex items-center gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 py-3.5">
            <Search className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search research history…"
              className="flex-1 bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Results List */}
          <div className="flex-1 overflow-y-auto p-2">
            {isAuthenticated ? (
              filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="h-6 w-6 text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    No research found matching "{query}"
                  </p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {filteredConversations.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          onSelectConversation(c.id);
                          onClose();
                        }}
                        className={cn(
                          "group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150",
                          "hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100",
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Sparkles className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium truncate">{c.title}</p>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                              {new Date(c.updatedAt).toLocaleDateString()} · {c.messageCount} messages
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : filteredLocal.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-6 w-6 text-zinc-300 dark:text-zinc-700 mb-2" />
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  No local history matching "{query}"
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredLocal.map((entry) => (
                  <li key={entry.id}>
                    <button
                      onClick={() => {
                        onSelectLocalEntry(entry);
                        onClose();
                      }}
                      className={cn(
                        "group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Clock className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate flex-1">
                          {entry.topic}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800/60 px-4 py-2 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center justify-between">
            <span>Press <kbd className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 font-mono">Esc</kbd> to exit</span>
            <span>Astera Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
