"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronRight,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Search,
  Pin,
  Edit2,
  Share2,
  Archive,
  Check,
  X,
  MoreVertical,
  Settings as SettingsIcon,
} from "lucide-react";
import type { ConversationSummary, HistoryEntry } from "@/lib/types";
import { UserMenu } from "@/components/auth/UserMenu";
import { ConfirmModal } from "@/components/ConfirmModal";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (id: string) => void;
  onSelectLocalEntry: (entry: HistoryEntry) => void;
  onNewResearch: () => void;
  onOpenSearch: () => void;
  onOpenAuthModal: () => void;
  onOpenSettings: () => void;
  conversations: ConversationSummary[];
  localEntries: HistoryEntry[];
  activeConversationId?: string;
  activeLocalId?: string;
  isAuthenticated: boolean;
  onRenameConversation?: (id: string, newTitle: string) => void;
  onShareConversation?: (id: string, title: string) => void;
  onPinConversation?: (id: string, isPinned: boolean) => void;
  onArchiveConversation?: (id: string, isArchived: boolean) => void;
  onDeleteConversation?: (id: string) => void;
  onClearLocalHistory?: () => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  onSelectConversation,
  onSelectLocalEntry,
  onNewResearch,
  onOpenSearch,
  onOpenAuthModal,
  onOpenSettings,
  conversations,
  localEntries,
  activeConversationId,
  activeLocalId,
  isAuthenticated,
  onRenameConversation,
  onShareConversation,
  onPinConversation,
  onArchiveConversation,
  onDeleteConversation,
  onClearLocalHistory,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const groupConversationsByDate = (items: ConversationSummary[]) => {
    const now = Date.now();
    const DAY = 86_400_000;

    const pinned: ConversationSummary[] = [];
    const groups: Record<string, ConversationSummary[]> = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    for (const c of items) {
      if (c.isPinned) {
        pinned.push(c);
        continue;
      }
      const time = new Date(c.updatedAt).getTime();
      const age = now - time;

      if (age < DAY) {
        groups["Today"].push(c);
      } else if (age < 2 * DAY) {
        groups["Yesterday"].push(c);
      } else if (age < 7 * DAY) {
        groups["Previous 7 Days"].push(c);
      } else {
        groups["Older"].push(c);
      }
    }

    return { pinned, groups };
  };

  const { pinned, groups } = groupConversationsByDate(conversations);
  const BUCKET_ORDER = ["Today", "Yesterday", "Previous 7 Days", "Older"];

  const handleStartRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim() && onRenameConversation) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Closed Floating Toggle Button */}
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
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className={cn(
              "fixed left-0 top-0 z-40 h-full w-64 flex flex-col",
              "border-r border-zinc-200/80 dark:border-zinc-800/80",
              "bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm",
            )}
            aria-label="Research navigation sidebar"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <button
                onClick={onNewResearch}
                className="flex items-center gap-2 text-left group focus-visible:outline-none"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs shadow-sm">
                  A
                </div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Astera
                </span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenSearch}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors"
                  title="Search research (Cmd+K)"
                  aria-label="Search research"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onOpenSettings}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors"
                  title="Settings"
                  aria-label="Settings"
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onToggle}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors"
                  aria-label="Close sidebar"
                  title="Close sidebar"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-3 flex flex-col gap-2">
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

            {/* Main History / Research Feed */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {isAuthenticated ? (
                conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
                    <Clock className="h-5 w-5 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      No research yet.
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
                      Start by asking your first question.
                    </p>
                  </div>
                ) : (
                  <nav className="space-y-4 pt-1">
                    {/* Pinned Section */}
                    {pinned.length > 0 && (
                      <div>
                        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                          <Pin className="h-2.5 w-2.5" />
                          <span>Pinned</span>
                        </p>
                        <ul className="space-y-0.5">
                          {pinned.map((item) => renderConversationItem(item))}
                        </ul>
                      </div>
                    )}

                    {/* Date Buckets */}
                    {BUCKET_ORDER.filter((b) => groups[b] && groups[b].length > 0).map(
                      (bucket) => (
                        <div key={bucket}>
                          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                            {bucket}
                          </p>
                          <ul className="space-y-0.5">
                            {groups[bucket].map((item) => renderConversationItem(item))}
                          </ul>
                        </div>
                      ),
                    )}
                  </nav>
                )
              ) : localEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
                  <Clock className="h-5 w-5 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    No research yet.
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-600">
                    Start by asking your first question.
                  </p>
                </div>
              ) : (
                <nav className="space-y-4 pt-1">
                  <div>
                    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                      Recent Session
                    </p>
                    <ul className="space-y-0.5">
                      {localEntries.map((entry) => (
                        <li key={entry.id}>
                          <button
                            onClick={() => onSelectLocalEntry(entry)}
                            className={cn(
                              "group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors duration-150",
                              activeLocalId === entry.id
                                ? "bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200",
                            )}
                          >
                            <span className="flex-1 truncate text-xs leading-snug">
                              {entry.topic}
                            </span>
                            <ChevronRight className="h-3 w-3 flex-shrink-0 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </nav>
              )}
            </div>

            {/* Footer with User Auth status & Settings */}
            <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 p-3 flex flex-col gap-2">
              <UserMenu onOpenAuthModal={onOpenAuthModal} />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog for single conversation deletion */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId && onDeleteConversation) {
            onDeleteConversation(deletingId);
          }
          setDeletingId(null);
        }}
        title="Delete Research Conversation?"
        description="Are you sure you want to delete this research? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive
      />
    </>
  );

  function renderConversationItem(item: ConversationSummary) {
    const isEditing = editingId === item.id;
    const isMenuOpen = menuOpenId === item.id;
    const isActive = activeConversationId === item.id;

    return (
      <li key={item.id} className="relative group">
        {isEditing ? (
          <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-zinc-900 border border-indigo-500 rounded-lg">
            <input
              type="text"
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveRename(item.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              className="flex-1 text-xs bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
            <button
              onClick={() => handleSaveRename(item.id)}
              className="p-1 text-emerald-600 hover:text-emerald-500"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setEditingId(null)} className="p-1 text-zinc-400">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors duration-150",
              isActive
                ? "bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-medium"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200",
            )}
          >
            <button
              onClick={() => onSelectConversation(item.id)}
              className="flex-1 min-w-0 text-left truncate text-xs leading-snug"
            >
              {item.title}
            </button>

            {/* Context Menu Trigger */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(isMenuOpen ? null : item.id);
                }}
                className={cn(
                  "p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded transition-opacity",
                  isMenuOpen || isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                )}
                aria-label="Conversation actions"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>

              {/* Context Dropdown Menu */}
              {isMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 z-50 w-36 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-xl text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleStartRename(item.id, item.title)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      onShareConversation?.(item.id, item.title);
                      setMenuOpenId(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => {
                      onPinConversation?.(item.id, !item.isPinned);
                      setMenuOpenId(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Pin className="h-3 w-3" />
                    <span>{item.isPinned ? "Unpin" : "Pin"}</span>
                  </button>
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  <button
                    onClick={() => {
                      setDeletingId(item.id);
                      setMenuOpenId(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </li>
    );
  }
}
