import { ALL_EVENT_TYPES, type EventType } from "@/lib/types";

export default function FilterBar({
  selected,
  onChange,
  counts,
}: {
  selected: Set<EventType>;
  onChange: (next: Set<EventType>) => void;
  counts: Record<EventType, number>;
}) {
  const toggle = (event: EventType) => {
    const next = new Set(selected);
    if (next.has(event)) {
      next.delete(event);
    } else {
      next.add(event);
    }
    onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <button
        type="button"
        onClick={() => onChange(new Set())}
        className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
          selected.size === 0
            ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
            : "border-black/[.08] text-zinc-600 hover:border-black/20 dark:border-white/[.145] dark:text-zinc-400"
        }`}
      >
        All
      </button>

      {ALL_EVENT_TYPES.map((event) => {
        const isActive = selected.has(event);
        return (
          <button
            key={event}
            type="button"
            onClick={() => toggle(event)}
            className={`rounded-full border px-3 py-1 font-mono text-xs font-medium transition-colors ${
              isActive
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-black/[.08] text-zinc-600 hover:border-black/20 dark:border-white/[.145] dark:text-zinc-400"
            }`}
          >
            {event}
            <span className={isActive ? "ml-1 opacity-80" : "ml-1 text-zinc-400 dark:text-zinc-500"}>
              {counts[event] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
