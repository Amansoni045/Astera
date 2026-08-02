export interface ResearchResult {
  topic: string;
  search_results: string;
  scraped_content: string;
  report: string;
  feedback: string;
}

export type PipelineStage =
  | "idle"
  | "searching"
  | "reading"
  | "writing"
  | "checking"
  | "done"
  | "error";

export interface PipelineStep {
  id: PipelineStage;
  label: string;
  description: string;
}

export interface Source {
  url: string;
  domain: string;
  title: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface ResearchSessionData {
  id: string;
  topic: string;
  stage: string;
  searchResults: string;
  scrapedContent: string;
  report: string;
  feedback: string;
  sources: Source[];
  createdAt?: string | number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string | number;
  researchSessionId?: string | null;
  researchSession?: ResearchSessionData | null;
}

export interface ConversationMetadataData {
  id?: string;
  model?: string | null;
  customInstructions?: string | null;
  shareToken?: string | null;
  isPublic?: boolean;
  settings?: Record<string, any> | null;
}

export interface ConversationSummary {
  id: string;
  userId: string;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string | number;
  updatedAt: string | number;
  messageCount: number;
  lastMessagePrompt?: string;
}

export interface FullConversation {
  id: string;
  userId: string;
  title: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string | number;
  updatedAt: string | number;
  messages: Message[];
  researchSessions: ResearchSessionData[];
  metadata?: ConversationMetadataData | null;
}

export interface HistoryEntry {
  id: string;
  topic: string;
  timestamp: number;
  result: ResearchResult;
  conversationId?: string;
}

export interface ParsedReport {
  title: string;
  sections: ReportSection[];
  sources: Source[];
  criticScore: string | null;
}

export interface ReportSection {
  title: string;
  content: string;
}
