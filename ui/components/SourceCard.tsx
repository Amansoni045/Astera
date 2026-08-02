"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import type { Source } from "@/lib/types";

interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const [imgError, setImgError] = useState(false);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(source.domain)}&sz=32`;

  return (
    <motion.a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
      className="group flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 sm:p-4 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      {/* Favicon or Globe Fallback */}
      <div className="mt-0.5 flex-shrink-0 h-5 w-5 overflow-hidden rounded flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        {!imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={faviconUrl}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <Globe className="h-3.5 w-3.5 text-zinc-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5 tracking-tight truncate">
          {source.domain}
        </p>
        <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug line-clamp-2 capitalize">
          {source.title || source.domain}
        </p>
      </div>

      {/* Link icon */}
      <ExternalLink
        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
        aria-hidden="true"
      />
    </motion.a>
  );
}
