export default function ErrorState({
  onRetry,
  retryDisabled,
}: {
  onRetry: () => void;
  retryDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-red-300 py-16 text-center dark:border-red-900">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Couldn&apos;t reach GitHub. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retryDisabled}
        className="rounded-full border border-black/[.08] px-3 py-1 text-sm font-medium text-zinc-700 hover:border-black/20 disabled:opacity-50 dark:border-white/[.145] dark:text-zinc-300"
      >
        Retry
      </button>
    </div>
  );
}
