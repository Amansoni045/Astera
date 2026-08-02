"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  timestamp?: string | number;
  userName?: string | null;
  userImage?: string | null;
}

export function MessageBubble({ content, timestamp, userName, userImage }: MessageBubbleProps) {
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : undefined;

  const initial = (userName || "U").charAt(0).toUpperCase();

  return (
    <div className="flex w-full flex-col gap-2 py-4">
      <div className="flex items-start justify-end gap-3">
        <div className="flex max-w-2xl flex-col items-end gap-1">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 shadow-sm",
              "bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200/60 dark:border-zinc-700/60",
              "whitespace-pre-wrap break-words",
            )}
          >
            {content}
          </div>
          {formattedTime && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 px-1 font-mono">
              {formattedTime}
            </span>
          )}
        </div>

        {userImage ? (
          <img
            src={userImage}
            alt="User avatar"
            className="h-8 w-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0 mt-0.5"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs flex-shrink-0 shadow-sm mt-0.5">
            {initial}
          </div>
        )}
      </div>
    </div>
  );
}
