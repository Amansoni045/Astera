import type { ParsedReport, ReportSection, Source } from "./types";

/**
 * Extracts a quality score like "8/10" or "9/10" from the critic feedback string.
 */
function extractScore(feedback: string): string | null {
  if (!feedback) return null;

  // Match formats like "Score: 8/10", "Score: 9.5/10", "Score 8/10"
  const match = feedback.match(/(?:Score|Rating)?\s*:?\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
  if (match) {
    return `${match[1]}/10`;
  }

  // Fallback for "Score: 8" or "8 out of 10"
  const outOfMatch = feedback.match(/(\d+(?:\.\d+)?)\s*(?:out of 10|\/10)/i);
  if (outOfMatch) {
    return `${outOfMatch[1]}/10`;
  }

  return null;
}

/**
 * Extracts all URLs found in any text, returning them as Source objects.
 */
function extractSources(text: string): Source[] {
  const urlRegex = /https?:\/\/[^\s\),\"\']+/g;
  const seen = new Set<string>();
  const sources: Source[] = [];

  for (const url of text.matchAll(urlRegex)) {
    const raw = url[0].replace(/[.,;:]+$/, "");
    if (seen.has(raw)) continue;
    seen.add(raw);

    try {
      const parsed = new URL(raw);
      sources.push({
        url: raw,
        domain: parsed.hostname.replace(/^www\./, ""),
        title: decodeURIComponent(
          parsed.pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") ?? parsed.hostname,
        ),
      });
    } catch {
      // skip malformed URLs
    }
  }

  return sources;
}

/**
 * Splits a markdown-style report text into titled sections.
 * Handles both `## Title` and `**Title**:` heading conventions.
 */
function splitIntoSections(text: string): ReportSection[] {
  // Normalise bold-style headings into ## headings
  const normalised = text
    .replace(/^\*\*([^*]+)\*\*\s*:?\s*/gm, "## $1\n")
    .replace(/^#{1}\s+/gm, "## ");

  const sectionRegex = /^##\s+(.+)$/gm;
  const sections: ReportSection[] = [];
  let lastIndex = 0;
  let lastTitle = "";

  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(normalised)) !== null) {
    if (lastTitle) {
      sections.push({
        title: lastTitle,
        content: normalised.slice(lastIndex, match.index).trim(),
      });
    }
    lastTitle = match[1].trim();
    lastIndex = match.index + match[0].length;
  }

  if (lastTitle) {
    sections.push({
      title: lastTitle,
      content: normalised.slice(lastIndex).trim(),
    });
  }

  return sections.filter((s) => s.content.length > 0);
}

/**
 * Parses the raw report string into a structured ParsedReport object.
 */
export function parseReport(
  topic: string,
  report: string,
  feedback: string,
  searchResults: string,
): ParsedReport {
  const sections = splitIntoSections(report);
  const sources = extractSources(searchResults + "\n" + report);
  const criticScore = extractScore(feedback);

  return {
    title: topic,
    sections,
    sources,
    criticScore,
  };
}

/**
 * Converts a bullet-point string like "- Item one\n- Item two" into an array of strings.
 */
export function parseBulletList(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0);
}

/**
 * Renders inline markdown (bold, italic, backticks) into a clean string.
 * Used for simple text sanitization before display.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}
