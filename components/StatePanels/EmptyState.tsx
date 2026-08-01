export default function EmptyState({
  onClear,
}: {
  // Omit onClear for the "no repos discovered at all" case — there's no
  // filter to clear when the topic search itself came back empty.
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-black/[.12] py-16 text-center dark:border-white/[.145]">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {onClear
          ? "No hooks match the selected filters."
          : "No repos are currently tagged claude-code-hook."}
      </p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-black/[.08] px-3 py-1 text-sm font-medium text-zinc-700 hover:border-black/20 dark:border-white/[.145] dark:text-zinc-300"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
