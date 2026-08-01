import type { HookCardData, RateLimitInfo } from "./types";

const CACHE_KEY = "hookhub:cache:v1";
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface CachedData {
  cards: HookCardData[];
  fetchedAt: number;
  rateLimit?: RateLimitInfo;
}

export function readCache(): CachedData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedData;
    if (typeof parsed.fetchedAt !== "number" || !Array.isArray(parsed.cards)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache(data: CachedData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable or full — caching is a nicety, not required for correctness
  }
}

export function isStale(fetchedAt: number): boolean {
  return Date.now() - fetchedAt > CACHE_TTL_MS;
}
