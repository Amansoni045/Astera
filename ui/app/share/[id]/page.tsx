import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, ArrowRight, Lock } from "lucide-react";
import { getPublicConversation } from "@/lib/repositories/conversationRepository";
import { ChatContainer, ChatTurn } from "@/components/chat/ChatContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const conversation = await getPublicConversation(id);

  if (!conversation) {
    return {
      title: "Research Not Found | Astera",
    };
  }

  return {
    title: `${conversation.title} | Shared Research | Astera`,
    description: `Read shared research on "${conversation.title}" on Astera.`,
  };
}

export default async function SharedResearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await getPublicConversation(id);

  if (!conversation) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Shared Research Unavailable</h1>
        <p className="mt-2 text-sm text-zinc-500 max-w-md leading-relaxed">
          This research link may be private or has been removed by its author.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900"
        >
          <span>Start your own research</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Group messages into turns for ChatContainer
  const turns: ChatTurn[] = [];
  for (let i = 0; i < conversation.messages.length; i++) {
    const msg = conversation.messages[i];
    if (msg.role === "user") {
      const assistantMsg = conversation.messages[i + 1];
      const resultData = assistantMsg?.researchSession
        ? {
            topic: assistantMsg.researchSession.topic,
            search_results: assistantMsg.researchSession.searchResults,
            scraped_content: assistantMsg.researchSession.scrapedContent,
            report: assistantMsg.researchSession.report,
            feedback: assistantMsg.researchSession.feedback,
          }
        : null;

      turns.push({
        id: msg.id,
        userPrompt: msg.content,
        userTimestamp: msg.createdAt,
        result: resultData,
      });
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header Banner */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs shadow-sm">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight">Astera</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-zinc-400">Read-Only Shared Research</span>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Research this topic</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 border-b border-zinc-100 dark:border-zinc-900 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {conversation.title}
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Published on {new Date(conversation.createdAt).toLocaleDateString()} · {turns.length} research turn{turns.length > 1 ? "s" : ""}
          </p>
        </div>

        <ChatContainer turns={turns} />
      </main>
    </div>
  );
}
