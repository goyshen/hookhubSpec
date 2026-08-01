"use client";

import { useMemo, useState } from "react";
import { useHookRepos } from "@/hooks/useHookRepos";
import { ALL_EVENT_TYPES, type EventType } from "@/lib/types";
import FilterBar from "@/components/FilterBar";
import HookGrid from "@/components/HookGrid";
import LoadingSkeleton from "@/components/StatePanels/LoadingSkeleton";
import EmptyState from "@/components/StatePanels/EmptyState";
import ErrorState from "@/components/StatePanels/ErrorState";
import RateLimitState from "@/components/StatePanels/RateLimitState";

export default function Home() {
  const { status, cards, rateLimit, stale, refresh, refreshDisabled } = useHookRepos();
  const [selected, setSelected] = useState<Set<EventType>>(new Set());

  const filtered = useMemo(() => {
    if (selected.size === 0) return cards;
    return cards.filter((card) => card.events.some((event) => selected.has(event)));
  }, [cards, selected]);

  const counts = useMemo(() => {
    const map = Object.fromEntries(ALL_EVENT_TYPES.map((event) => [event, 0])) as Record<
      EventType,
      number
    >;
    for (const card of cards) {
      for (const event of card.events) {
        map[event] += 1;
      }
    }
    return map;
  }, [cards]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:px-10">
      {(status === "loading" || status === "idle") && <LoadingSkeleton />}

      {status === "rate-limited" && (
        <RateLimitState rateLimit={rateLimit} onRetry={refresh} retryDisabled={refreshDisabled} />
      )}

      {status === "error" && <ErrorState onRetry={refresh} retryDisabled={refreshDisabled} />}

      {status === "success" && (
        <>
          {stale && (
            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              Showing cached results from earlier — GitHub couldn&apos;t be reached for a fresh
              load.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <FilterBar selected={selected} onChange={setSelected} counts={counts} />
            <button
              type="button"
              onClick={refresh}
              disabled={refreshDisabled}
              className="rounded-full border border-black/[.08] px-3 py-1 text-sm font-medium text-zinc-700 hover:border-black/20 disabled:opacity-50 dark:border-white/[.145] dark:text-zinc-300"
            >
              Refresh
            </button>
          </div>

          {filtered.length === 0 ? (
            cards.length === 0 ? (
              <EmptyState />
            ) : (
              <EmptyState onClear={() => setSelected(new Set())} />
            )
          ) : (
            <HookGrid cards={filtered} />
          )}
        </>
      )}
    </main>
  );
}
