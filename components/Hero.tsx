export default function Hero() {
  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-black/[.08] bg-white dark:border-white/[.145] dark:bg-zinc-950">
      <div className="flex flex-col gap-6 px-6 py-10 sm:px-10 sm:py-14">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
          Open, community-driven directory
        </span>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
            Discover hooks for Claude Code
          </h1>
          <p className="max-w-2xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            Browse community-built hooks that wire custom scripts into Claude Code&apos;s
            lifecycle — from pre-tool checks to post-generation formatting. Filter by event
            type to find the ones that fit your workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#hooks"
            className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Browse hooks
          </a>
          <a
            href="https://github.com/topics/claude-code-hook"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium text-zinc-700 hover:border-black/20 dark:border-white/[.145] dark:text-zinc-300 dark:hover:border-white/30"
          >
            List your hook &rarr;
          </a>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Add the{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              claude-code-hook
            </code>{" "}
            topic to opt in
          </span>
        </div>
      </div>
    </section>
  );
}
