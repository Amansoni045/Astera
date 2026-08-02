"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  conversationTitle?: string;
}

export function ShareModal({
  isOpen,
  onClose,
  conversationId,
  conversationTitle,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && conversationId) {
      setLoading(true);
      fetch(`/api/conversations/${conversationId}/share`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.shareUrl) {
            setShareUrl(data.shareUrl);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setShareUrl("");
      setCopied(false);
    }
  }, [isOpen, conversationId]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={cn(
            "relative w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-2xl border",
            "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
          )}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
            aria-label="Close share dialog"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">Share Research</h3>
                <p className="text-xs text-zinc-400 truncate max-w-[240px]">
                  {conversationTitle || "Public link"}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Anyone with this link can view a read-only snapshot of this research report and its sources. Only you can edit or add follow-ups.
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-2">
              <Globe className="h-4 w-4 text-zinc-400 ml-2 flex-shrink-0" />
              <input
                type="text"
                readOnly
                value={loading ? "Generating public link…" : shareUrl}
                className="flex-1 bg-transparent text-xs text-zinc-700 dark:text-zinc-300 font-mono focus:outline-none truncate"
              />
              <button
                onClick={handleCopy}
                disabled={loading || !shareUrl}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex-shrink-0 shadow-sm",
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200",
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
