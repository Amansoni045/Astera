"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  onSubmit: (topic: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  submitLabel?: string;
}

export const SearchInput = forwardRef<HTMLTextAreaElement, SearchInputProps>(
  function SearchInput(
    {
      onSubmit,
      disabled = false,
      autoFocus = false,
      placeholder = "Research anything…",
      submitLabel = "Research",
    },
    ref,
  ) {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

    const [value, setValue] = useState("");

    const adjustHeight = () => {
      const el = internalRef.current;
      if (!el) return;
      el.style.height = "auto";
      const nextHeight = Math.min(el.scrollHeight, 200);
      el.style.height = `${nextHeight}px`;
    };

    useEffect(() => {
      adjustHeight();
    }, [value]);

    useEffect(() => {
      if (autoFocus && internalRef.current) {
        internalRef.current.focus();
      }
    }, [autoFocus]);

    const handleFormSubmit = () => {
      const trimmed = value.trim();
      if (trimmed && !disabled) {
        onSubmit(trimmed);
        setValue("");
        if (internalRef.current) {
          internalRef.current.style.height = "auto";
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleFormSubmit();
      }
    };

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit();
        }}
        role="search"
        aria-label="Research topic"
        className="relative w-full"
      >
        <div
          className={cn(
            "group relative flex items-end rounded-2xl border transition-all duration-200 p-2 sm:p-2.5",
            "border-zinc-200 dark:border-zinc-800",
            "bg-white dark:bg-zinc-900",
            "shadow-sm hover:shadow-md",
            "focus-within:border-zinc-400 dark:focus-within:border-zinc-600",
            "focus-within:shadow-md",
            disabled && "opacity-60 pointer-events-none",
          )}
        >
          <div className="pb-2.5 pl-3 text-zinc-400 dark:text-zinc-600 flex-shrink-0">
            <Search className="h-4 w-4" aria-hidden="true" />
          </div>

          <textarea
            ref={internalRef}
            rows={1}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "flex-1 bg-transparent px-3 py-2 text-sm sm:text-base text-zinc-900 dark:text-zinc-100",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
              "focus:outline-none resize-none min-h-[44px] max-h-48 overflow-y-auto leading-relaxed",
              "selection:bg-indigo-100 dark:selection:bg-indigo-900",
            )}
            aria-label="Research prompt input"
          />

          <motion.button
            type="submit"
            disabled={disabled || !value.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-0.5",
              "bg-zinc-900 dark:bg-zinc-100",
              "text-white dark:text-zinc-900",
              "text-xs sm:text-sm font-medium",
              "transition-colors duration-150 flex-shrink-0",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
            aria-label="Submit research prompt"
          >
            <span className="hidden sm:inline">{submitLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </motion.button>
        </div>
      </form>
    );
  },
);
