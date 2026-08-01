"use client";

import { useRef, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSubmit: (topic: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ onSubmit, disabled = false, autoFocus = false }, ref) {
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef;

    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus, inputRef]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const value = inputRef.current?.value.trim() ?? "";
      if (value) onSubmit(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit(e);
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Research topic"
        className="relative w-full"
      >
        <div
          className={cn(
            "group relative flex items-center rounded-2xl border transition-all duration-200",
            "border-zinc-200 dark:border-zinc-800",
            "bg-white dark:bg-zinc-900",
            "shadow-sm hover:shadow-md",
            "focus-within:border-zinc-400 dark:focus-within:border-zinc-600",
            "focus-within:shadow-md",
            disabled && "opacity-60 pointer-events-none",
          )}
        >
          <Search
            className="ml-5 h-4 w-4 flex-shrink-0 text-zinc-400 dark:text-zinc-600"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            name="topic"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            placeholder="Research anything…"
            onKeyDown={handleKeyDown}
            className={cn(
              "flex-1 bg-transparent px-4 py-4 text-base text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
              "focus:outline-none",
              "selection:bg-indigo-100 dark:selection:bg-indigo-900",
            )}
            aria-label="Research topic input"
          />
          <motion.button
            type="submit"
            disabled={disabled}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
              "mr-2 flex items-center gap-2 rounded-xl px-4 py-2.5",
              "bg-zinc-900 dark:bg-zinc-100",
              "text-white dark:text-zinc-900",
              "text-sm font-medium",
              "transition-colors duration-150",
              "hover:bg-zinc-700 dark:hover:bg-zinc-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
            aria-label="Start research"
          >
            <span className="hidden sm:inline">Research</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </motion.button>
        </div>
      </form>
    );
  },
);
