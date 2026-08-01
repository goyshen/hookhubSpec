"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAndMergeAll } from "@/lib/github";
import { isStale, readCache, writeCache } from "@/lib/cache";
import type { HookReposState } from "@/lib/types";

const REFRESH_COOLDOWN_MS = 60 * 1000;

export interface UseHookReposResult extends HookReposState {
  refresh: () => void;
  refreshDisabled: boolean;
}

function hydrateFromCache(): HookReposState | null {
  const cached = readCache();
  if (!cached || isStale(cached.fetchedAt)) return null;
  return {
    status: "success",
    cards: cached.cards,
    rateLimit: cached.rateLimit,
    fetchedAt: cached.fetchedAt,
  };
}

export function useHookRepos(): UseHookReposResult {
  const [state, setState] = useState<HookReposState>(
    () => hydrateFromCache() ?? { status: "loading", cards: [] },
  );
  const [cooldownActive, setCooldownActive] = useState(false);

  // Always performs a network fetch — callers are responsible for deciding
  // whether a fresh cache makes that unnecessary (see hydrateFromCache above).
  const runFetch = useCallback(async () => {
    const cached = readCache();

    try {
      const result = await fetchAndMergeAll();

      if (result.outcome !== "ok") {
        if (cached) {
          // Prefer stale cached data over a blank screen when a full refresh fails.
          setState({
            status: "success",
            cards: cached.cards,
            rateLimit: result.rateLimit ?? cached.rateLimit,
            fetchedAt: cached.fetchedAt,
            stale: true,
          });
          return;
        }

        setState({
          status: result.outcome === "rate-limited" ? "rate-limited" : "error",
          cards: [],
          rateLimit: result.rateLimit,
        });
        return;
      }

      // outcome "ok" is a successful search — even with zero cards (no repo
      // currently carries the topic), this is a real "success" state, not an
      // error; page.tsx renders that as an empty-discovery message rather
      // than folding it into "zero results after filtering".
      const fetchedAt = Date.now();
      writeCache({ cards: result.cards, fetchedAt, rateLimit: result.rateLimit });
      setState({
        status: "success",
        cards: result.cards,
        rateLimit: result.rateLimit,
        fetchedAt,
      });
    } catch {
      if (cached) {
        setState({
          status: "success",
          cards: cached.cards,
          rateLimit: cached.rateLimit,
          fetchedAt: cached.fetchedAt,
          stale: true,
        });
        return;
      }

      setState({ status: "error", cards: [] });
    }
  }, []);

  useEffect(() => {
    // Fresh cache is already reflected via the useState initializer above;
    // only hit the network when that initial hydration didn't happen. All
    // setState calls inside runFetch happen after an `await`, never
    // synchronously — this is the standard fetch-on-mount pattern.
    if (hydrateFromCache()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch, no sync setState
    runFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cooldownActive) return;
    const timeout = setTimeout(() => setCooldownActive(false), REFRESH_COOLDOWN_MS);
    return () => clearTimeout(timeout);
  }, [cooldownActive]);

  const refresh = useCallback(() => {
    if (cooldownActive) return;
    setCooldownActive(true);
    setState((prev) => ({ ...prev, status: "loading" }));
    runFetch();
  }, [cooldownActive, runFetch]);

  return { ...state, refresh, refreshDisabled: cooldownActive };
}
