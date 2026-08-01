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

export interface HistoryEntry {
  id: string;
  topic: string;
  timestamp: number;
  result: ResearchResult;
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

export interface Source {
  url: string;
  domain: string;
  title: string;
}
