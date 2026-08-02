"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  X,
  Settings as SettingsIcon,
  User as UserIcon,
  Database,
  Info,
  Sun,
  Moon,
  Laptop,
  Download,
  Trash2,
  ExternalLink,
  Shield,
  LogOut,
} from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshConversations?: () => void;
}

type TabType = "general" | "account" | "data" | "about";

export function SettingsModal({
  isOpen,
  onClose,
  onRefreshConversations,
}: SettingsModalProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleExportData = () => {
    window.open("/api/user/data", "_blank");
  };

  const handleDeleteAllConversations = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/data", { method: "DELETE" });
      if (res.ok) {
        onRefreshConversations?.();
      }
    } catch {
      // Handle delete error
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={cn(
              "relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl border flex flex-col md:flex-row min-h-[480px] max-h-[85vh]",
              "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100",
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left Navigation Tabs */}
            <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-zinc-200/80 dark:border-zinc-800/80 p-3 bg-zinc-50/50 dark:bg-zinc-950/50 flex md:flex-col gap-1 flex-shrink-0">
              <div className="px-3 py-2 hidden md:block">
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Settings
                </p>
              </div>

              <button
                onClick={() => setActiveTab("general")}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors w-full text-left",
                  activeTab === "general"
                    ? "bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                )}
              >
                <SettingsIcon className="h-4 w-4 text-zinc-500" />
                <span>General</span>
              </button>

              <button
                onClick={() => setActiveTab("account")}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors w-full text-left",
                  activeTab === "account"
                    ? "bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                )}
              >
                <UserIcon className="h-4 w-4 text-zinc-500" />
                <span>Account</span>
              </button>

              <button
                onClick={() => setActiveTab("data")}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors w-full text-left",
                  activeTab === "data"
                    ? "bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                )}
              >
                <Database className="h-4 w-4 text-zinc-500" />
                <span>Data</span>
              </button>

              <button
                onClick={() => setActiveTab("about")}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors w-full text-left",
                  activeTab === "about"
                    ? "bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                )}
              >
                <Info className="h-4 w-4 text-zinc-500" />
                <span>About</span>
              </button>
            </div>

            {/* Right Content View */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === "general" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      General Settings
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Customize app appearance and preferences.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        onClick={() => setTheme("light")}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
                          theme === "light"
                            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400",
                        )}
                      >
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </button>

                      <button
                        onClick={() => setTheme("dark")}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
                          theme === "dark"
                            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400",
                        )}
                      >
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </button>

                      <button
                        onClick={() => setTheme("system")}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
                          theme === "system"
                            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                            : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400",
                        )}
                      >
                        <Laptop className="h-4 w-4" />
                        <span>System</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "account" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Account & Profile
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Manage your active identity and authentication.
                    </p>
                  </div>

                  {session?.user ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt=""
                            className="h-12 w-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-base">
                            {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {session.user.name || "Authenticated User"}
                          </p>
                          <p className="text-xs text-zinc-400 truncate">{session.user.email}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400">
                      You are currently browsing in anonymous mode. Sign in to save research history across devices.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "data" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Data Management
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Export or clear your personal research data.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Export */}
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          Export Research Data
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Download a JSON file containing all your conversations, messages, and reports.
                        </p>
                      </div>
                      <button
                        onClick={handleExportData}
                        disabled={!session?.user}
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export</span>
                      </button>
                    </div>

                    {/* Delete All Conversations */}
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200/80 dark:border-rose-900/60 p-4 bg-rose-50/30 dark:bg-rose-950/10">
                      <div>
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          Delete All Conversations
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Permanently delete all research history associated with your account.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        disabled={!session?.user || isDeleting}
                        className="flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-rose-700 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete All</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      About Astera
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Autonomous deep research workspace & evidence engine.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      <strong className="text-zinc-900 dark:text-zinc-100">Version:</strong> 1.0.0 Production Release
                    </p>
                    <p>
                      <strong className="text-zinc-900 dark:text-zinc-100">License:</strong> MIT Open Source License
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href="https://github me/amansoni/Astera"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>GitHub Repository</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Confirmation Modal for Delete All Conversations */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAllConversations}
        title="Delete All Conversations?"
        description="Are you sure you want to permanently delete all your research history? This action cannot be undone."
        confirmLabel="Delete All"
        isDestructive
      />
    </>
  );
}
