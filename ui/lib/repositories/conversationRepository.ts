import { prisma } from "../prisma";
import type { ConversationSummary, FullConversation, ResearchResult, Source } from "../types";
import { extractSources } from "../parser";

export function generateTitleFromPrompt(prompt: string): string {
  const clean = prompt.trim().replace(/\s+/g, " ");
  if (clean.length <= 50) return clean;
  return clean.slice(0, 47) + "…";
}

export async function getUserConversations(
  userId: string,
  options?: { search?: string; archived?: boolean },
): Promise<ConversationSummary[]> {
  const whereClause: any = {
    userId,
    isArchived: options?.archived ?? false,
  };

  if (options?.search && options.search.trim()) {
    const q = options.search.trim();
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { messages: { some: { content: { contains: q, mode: "insensitive" } } } },
      { researchSessions: { some: { report: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const conversations = await prisma.conversation.findMany({
    where: whereClause,
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { content: true },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  return conversations.map((c) => ({
    id: c.id,
    userId: c.userId,
    title: c.title,
    isPinned: c.isPinned,
    isArchived: c.isArchived,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    messageCount: c._count.messages,
    lastMessagePrompt: c.messages[0]?.content || c.title,
  }));
}

export async function getConversationById(
  userId: string,
  conversationId: string,
): Promise<FullConversation | null> {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          researchSession: {
            include: { sources: true },
          },
        },
      },
      researchSessions: {
        include: { sources: true },
      },
      metadata: true,
    },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    userId: conversation.userId,
    title: conversation.title,
    isPinned: conversation.isPinned,
    isArchived: conversation.isArchived,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      researchSessionId: m.researchSessionId,
      researchSession: m.researchSession
        ? {
            id: m.researchSession.id,
            topic: m.researchSession.topic,
            stage: m.researchSession.stage,
            searchResults: m.researchSession.searchResults,
            scrapedContent: m.researchSession.scrapedContent,
            report: m.researchSession.report,
            feedback: m.researchSession.feedback,
            sources: m.researchSession.sources.map((s) => ({
              url: s.url,
              domain: s.domain,
              title: s.title,
            })),
            createdAt: m.researchSession.createdAt.toISOString(),
          }
        : null,
    })),
    researchSessions: conversation.researchSessions.map((rs) => ({
      id: rs.id,
      topic: rs.topic,
      stage: rs.stage,
      searchResults: rs.searchResults,
      scrapedContent: rs.scrapedContent,
      report: rs.report,
      feedback: rs.feedback,
      sources: rs.sources.map((s) => ({
        url: s.url,
        domain: s.domain,
        title: s.title,
      })),
      createdAt: rs.createdAt.toISOString(),
    })),
    metadata: conversation.metadata
      ? {
          id: conversation.metadata.id,
          model: conversation.metadata.model,
          customInstructions: conversation.metadata.customInstructions,
          shareToken: conversation.metadata.shareToken,
          isPublic: conversation.metadata.isPublic,
          settings: conversation.metadata.settings as Record<string, any> | null,
        }
      : null,
  };
}

export async function getPublicConversation(idOrToken: string): Promise<FullConversation | null> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { id: idOrToken, metadata: { isPublic: true } },
        { metadata: { shareToken: idOrToken, isPublic: true } },
      ],
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          researchSession: {
            include: { sources: true },
          },
        },
      },
      researchSessions: {
        include: { sources: true },
      },
      metadata: true,
    },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    userId: conversation.userId,
    title: conversation.title,
    isPinned: conversation.isPinned,
    isArchived: conversation.isArchived,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages: conversation.messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      researchSessionId: m.researchSessionId,
      researchSession: m.researchSession
        ? {
            id: m.researchSession.id,
            topic: m.researchSession.topic,
            stage: m.researchSession.stage,
            searchResults: m.researchSession.searchResults,
            scrapedContent: m.researchSession.scrapedContent,
            report: m.researchSession.report,
            feedback: m.researchSession.feedback,
            sources: m.researchSession.sources.map((s) => ({
              url: s.url,
              domain: s.domain,
              title: s.title,
            })),
            createdAt: m.researchSession.createdAt.toISOString(),
          }
        : null,
    })),
    researchSessions: conversation.researchSessions.map((rs) => ({
      id: rs.id,
      topic: rs.topic,
      stage: rs.stage,
      searchResults: rs.searchResults,
      scrapedContent: rs.scrapedContent,
      report: rs.report,
      feedback: rs.feedback,
      sources: rs.sources.map((s) => ({
        url: s.url,
        domain: s.domain,
        title: s.title,
      })),
      createdAt: rs.createdAt.toISOString(),
    })),
    metadata: conversation.metadata
      ? {
          id: conversation.metadata.id,
          model: conversation.metadata.model,
          customInstructions: conversation.metadata.customInstructions,
          shareToken: conversation.metadata.shareToken,
          isPublic: conversation.metadata.isPublic,
          settings: conversation.metadata.settings as Record<string, any> | null,
        }
      : null,
  };
}

export async function createConversation(
  userId: string,
  initialPrompt: string,
  result?: ResearchResult,
): Promise<FullConversation> {
  const title = generateTitleFromPrompt(initialPrompt);

  const created = await prisma.conversation.create({
    data: {
      userId,
      title,
      messages: {
        create: {
          role: "user",
          content: initialPrompt,
        },
      },
      metadata: {
        create: {},
      },
    },
    include: {
      messages: true,
    },
  });

  if (result) {
    await addResearchTurn(userId, created.id, initialPrompt, result, created.messages[0].id);
  }

  const full = await getConversationById(userId, created.id);
  if (!full) throw new Error("Failed to retrieve newly created conversation.");
  return full;
}

export async function addResearchTurn(
  userId: string,
  conversationId: string,
  prompt: string,
  result: ResearchResult,
  existingUserMessageId?: string,
): Promise<FullConversation> {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conv) {
    throw new Error("Conversation not found or unauthorized.");
  }

  const parsedSources: Source[] = extractSources(result.search_results + "\n" + result.report);

  let userMessageId = existingUserMessageId;
  if (!userMessageId) {
    const userMsg = await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content: prompt,
      },
    });
    userMessageId = userMsg.id;
  }

  const researchSession = await prisma.researchSession.create({
    data: {
      conversationId,
      topic: result.topic || prompt,
      stage: "done",
      searchResults: result.search_results,
      scrapedContent: result.scraped_content,
      report: result.report,
      feedback: result.feedback,
      sources: {
        create: parsedSources.map((s) => ({
          url: s.url,
          domain: s.domain || "web",
          title: s.title || s.url,
        })),
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId,
      role: "assistant",
      content: result.report,
      researchSessionId: researchSession.id,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const updated = await getConversationById(userId, conversationId);
  if (!updated) throw new Error("Failed to fetch updated conversation");
  return updated;
}

export async function generateShareToken(userId: string, conversationId: string): Promise<string> {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
    include: { metadata: true },
  });

  if (!conv) {
    throw new Error("Conversation not found or unauthorized.");
  }

  const shareToken = conv.metadata?.shareToken || `share_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await prisma.conversationMetadata.upsert({
    where: { conversationId },
    create: {
      conversationId,
      shareToken,
      isPublic: true,
    },
    update: {
      shareToken,
      isPublic: true,
    },
  });

  return shareToken;
}

export async function updateConversation(
  userId: string,
  conversationId: string,
  data: { title?: string; isPinned?: boolean; isArchived?: boolean },
) {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conv) {
    throw new Error("Conversation not found or unauthorized.");
  }

  return prisma.conversation.update({
    where: { id: conversationId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
      ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
    },
  });
}

export async function deleteConversation(userId: string, conversationId: string) {
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conv) {
    throw new Error("Conversation not found or unauthorized.");
  }

  return prisma.conversation.delete({
    where: { id: conversationId },
  });
}

export async function deleteAllUserConversations(userId: string) {
  return prisma.conversation.deleteMany({
    where: { userId },
  });
}

export async function exportUserData(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      researchSessions: { include: { sources: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    exportedAt: new Date().toISOString(),
    userId,
    conversationCount: conversations.length,
    conversations,
  };
}
