export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950"
        >
          <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-3 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 h-5 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-6 h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}
