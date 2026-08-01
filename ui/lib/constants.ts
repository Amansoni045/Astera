import type { PipelineStep } from "./types";

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "searching",
    label: "Searching the web",
    description: "Finding recent, reliable sources on your topic",
  },
  {
    id: "reading",
    label: "Reading trusted sources",
    description: "Extracting detailed content from the best results",
  },
  {
    id: "writing",
    label: "Writing your report",
    description: "Synthesising everything into a structured overview",
  },
  {
    id: "checking",
    label: "Checking for gaps",
    description: "Reviewing the report for completeness and accuracy",
  },
];

export const STAGE_ORDER: Array<(typeof PIPELINE_STEPS)[number]["id"]> = [
  "searching",
  "reading",
  "writing",
  "checking",
];
