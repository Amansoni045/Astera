"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, X, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SearchInput } from "@/components/SearchInput";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { SearchModal } from "@/components/SearchModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { ShareModal } from "@/components/ShareModal";
import { useConversation } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";

export default function WorkspacePage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<{ id: string; title: string } | null>(null);
  const [lastTopic, setLastTopic] = useState("");

  const {
    isAuthenticated,
    conversations,
    localEntries,
    activeConversationId,
    activeLocalId,
    turns,
    stage,
    completedStages,
    error,
    newResearch,
    loadConversation,
    selectLocalEntry,
    executeResearchPrompt,
    renameConversation,
    pinConversation,
    archiveConversation,
    deleteConversation,
    clearLocal,
  } = useConversation();

  const isIdle = turns.length === 0;
  const isStreaming = stage !== "idle" && stage !== "done" && stage !== "error";
  const isError = stage === "error";

  const handleSubmit = useCallback(
    (topic: string) => {
      setLastTopic(topic);
      executeResearchPrompt(topic);
    },
    [executeResearchPrompt],
  );

  const handleRetry = useCallback(() => {
    if (lastTopic) {
      handleSubmit(lastTopic);
    }
  }, [handleSubmit, lastTopic]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onSelectConversation={loadConversation}
        onSelectLocalEntry={selectLocalEntry}
        onNewResearch={newResearch}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        conversations={conversations}
        localEntries={localEntries}
        activeConversationId={activeConversationId}
        activeLocalId={activeLocalId}
        isAuthenticated={isAuthenticated}
        onRenameConversation={renameConversation}
        onShareConversation={(id, title) => setShareTarget({ id, title })}
        onPinConversation={pinConversation}
        onArchiveConversation={archiveConversation}
        onDeleteConversation={deleteConversation}
        onClearLocalHistory={clearLocal}
      />

      {/* Main Workspace */}
      <main
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "pl-0 md:pl-64" : "pl-0",
        )}
        id="main-content"
      >
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex flex-col">
          {/* Idle / Landing View */}
          {isIdle && (
            <AnimatePresence mode="wait">
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center justify-center flex-1 my-auto gap-10 py-12"
              >
                <div className="flex flex-col items-center gap-4 text-center max-w-lg">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Research anything.
                  </h1>
                  <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Ask a question and Astera will search the web, read sources, and generate structured, comprehensive research reports.
                  </p>
                </div>

                <div className="w-full max-w-xl">
                  <SearchInput onSubmit={handleSubmit} autoFocus />
                  <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-600">
                    Press <kbd className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">Enter</kbd> to submit, <kbd className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">Shift+Enter</kbd> for newline
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Active Conversation Feed */}
          {!isIdle && (
            <div className="flex-1 flex flex-col justify-between">
              <ChatContainer
                turns={turns}
                activeStage={stage}
                activeCompletedStages={completedStages}
                onNewResearch={newResearch}
                userName={session?.user?.name}
                userImage={session?.user?.image}
              />

              {/* Error Banner */}
              {isError && (
                <div
                  role="alert"
                  className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500 dark:text-zinc-400"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        We couldn't complete this research right now.
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Please try again in a few moments.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {lastTopic && (
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Try again</span>
                      </button>
                    )}
                    <button
                      onClick={newResearch}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus-visible:outline-none rounded-lg"
                      aria-label="Dismiss error"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Multi-Turn Follow-Up Input */}
              <div className="sticky bottom-4 z-20 pt-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
                <SearchInput
                  onSubmit={handleSubmit}
                  disabled={isStreaming}
                  placeholder="Ask a follow-up question or start another research topic…"
                  submitLabel="Send"
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Quick Search Modal (Cmd+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        conversations={conversations}
        localEntries={localEntries}
        onSelectConversation={loadConversation}
        onSelectLocalEntry={selectLocalEntry}
        isAuthenticated={isAuthenticated}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onRefreshConversations={newResearch}
      />

      {/* Public Share Link Modal */}
      <ShareModal
        isOpen={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
        conversationId={shareTarget?.id}
        conversationTitle={shareTarget?.title}
      />
    </div>
  );
}
