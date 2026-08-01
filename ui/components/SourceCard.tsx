"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { Source } from "@/lib/types";

interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`;

  return (
    <motion.a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
      className="group flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      {/* Favicon */}
      <div className="mt-0.5 flex-shrink-0 h-5 w-5 overflow-hidden rounded">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faviconUrl}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-0.5">
          {source.domain}
        </p>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2 capitalize">
          {source.title || source.domain}
        </p>
      </div>

      {/* Link icon */}
      <ExternalLink
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-300 dark:text-zinc-700 transition-colors group-hover:text-zinc-500 dark:group-hover:text-zinc-400"
        aria-hidden="true"
      />
    </motion.a>
  );
}
