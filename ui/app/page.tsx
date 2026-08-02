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
import { SettingsModal, type TabType } from "@/components/settings/SettingsModal";
import { ShareModal } from "@/components/ShareModal";
import { useConversation } from "@/hooks/useConversation";
import { cn } from "@/lib/utils";

export default function WorkspacePage() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<TabType>("general");
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

  const handleOpenSettings = (tab: TabType = "general") => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const handleSubmit = useCallback(
    (prompt: string) => {
      setLastTopic(prompt);
      executeResearchPrompt(prompt);
    },
    [executeResearchPrompt],
  );

  const handleRetry = useCallback(() => {
    if (lastTopic) {
      executeResearchPrompt(lastTopic);
    }
  }, [lastTopic, executeResearchPrompt]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onNewResearch={newResearch}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenSettings={handleOpenSettings}
        isAuthenticated={isAuthenticated}
        conversations={conversations}
        localEntries={localEntries}
        activeConversationId={activeConversationId}
        activeLocalId={activeLocalId}
        onSelectConversation={loadConversation}
        onSelectLocalEntry={selectLocalEntry}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        onPinConversation={pinConversation}
        onShareConversation={(id, title) => setShareTarget({ id, title })}
      />

      {/* Main Content Workspace */}
      <main
        className={cn(
          "flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 relative",
          sidebarOpen ? "md:ml-64" : "ml-0",
        )}
      >
        {/* Main Workspace Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 max-w-4xl w-full mx-auto flex flex-col justify-between">
          {/* Landing State when Idle */}
          {isIdle ? (
            <div className="flex-1 flex flex-col items-center justify-center my-auto min-h-[70vh] py-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-6 max-w-xl w-full"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xl shadow-lg">
                  A
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    What would you like to research today?
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Astera conducts autonomous web research, synthesizes evidence across dynamic sources, and compiles structured research dossiers.
                  </p>
                </div>

                <div className="w-full mt-4">
                  <SearchInput
                    onSubmit={handleSubmit}
                    disabled={isStreaming}
                    placeholder="Enter any research topic, question, or hypothesis…"
                    submitLabel="Research"
                  />
                </div>
              </motion.div>
            </div>
          ) : (
            /* Active Research Stream & Report View */
            <div className="flex-1 flex flex-col justify-between gap-6 min-h-[85vh]">
              {/* Chat Turn Stack & Reports */}
              <ChatContainer
                turns={turns}
                currentStage={stage}
                completedStages={completedStages}
                isStreaming={isStreaming}
              />

              {/* Error Alert Display */}
              {isError && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-4 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error || "An error occurred during research pipeline execution."}</span>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}
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
        initialTab={settingsTab}
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
