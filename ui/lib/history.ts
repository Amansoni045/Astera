import type { HistoryEntry } from "./types";

const STORAGE_KEY = "astera_session_history";
const MAX_ENTRIES = 50;

/**
 * Returns transient history for anonymous users (sessionStorage only).
 * Automatically clears when browser tab/session is closed.
 */
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry): void {
  if (typeof window === "undefined") return;
  const existing = getHistory().filter((e) => e.id !== entry.id);
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Fail silently if storage unavailable
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Fail silently
  }
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
