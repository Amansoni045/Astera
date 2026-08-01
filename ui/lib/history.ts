import type { HistoryEntry } from "./types";

const STORAGE_KEY = "astera_history";
const MAX_ENTRIES = 50;

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry): void {
  if (typeof window === "undefined") return;
  const existing = getHistory().filter((e) => e.id !== entry.id);
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Groups history entries into time buckets for display.
 */
export function groupHistoryByDate(
  entries: HistoryEntry[],
): Record<string, HistoryEntry[]> {
  const now = Date.now();
  const DAY = 86_400_000;

  const groups: Record<string, HistoryEntry[]> = {};

  for (const entry of entries) {
    const age = now - entry.timestamp;
    let bucket: string;

    if (age < DAY) {
      bucket = "Today";
    } else if (age < 2 * DAY) {
      bucket = "Yesterday";
    } else if (age < 7 * DAY) {
      bucket = "This week";
    } else {
      bucket = "Earlier";
    }

    if (!groups[bucket]) groups[bucket] = [];
    groups[bucket].push(entry);
  }

  return groups;
}
