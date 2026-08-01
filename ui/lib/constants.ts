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
    label: "Checking for missing information",
    description: "Reviewing the report for completeness and accuracy",
  },
];

export const STAGE_ORDER: Array<(typeof PIPELINE_STEPS)[number]["id"]> = [
  "searching",
  "reading",
  "writing",
  "checking",
];

export const ROTATING_STATUS_MESSAGES = [
  "Searching trusted sources...",
  "Reading the latest information...",
  "Comparing different viewpoints...",
  "Looking for reliable references...",
  "Connecting related information...",
  "Writing your report...",
  "Checking for missing details...",
  "Organizing everything clearly...",
  "Preparing the final version...",
  "Almost ready...",
];

export const LONG_WAIT_MESSAGES = [
  {
    thresholdSeconds: 15,
    message: "This is taking a little longer than usual because we're gathering and reviewing multiple sources.",
  },
  {
    thresholdSeconds: 35,
    message: "We're still working. Some topics require checking many sources before preparing a reliable answer.",
  },
  {
    thresholdSeconds: 60,
    message: "Thanks for waiting. We're making sure the information is as complete and accurate as possible.",
  },
];
