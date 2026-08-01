import type { HookCardData } from "@/lib/types";
import InstallSnippet from "./InstallSnippet";

export default function HookCard({ card }: { card: HookCardData }) {
  return (
    <article className="group flex flex-col rounded-xl border border-black/[.08] bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-black/[.12] hover:shadow-lg dark:border-white/[.11] dark:bg-zinc-950 dark:hover:border-white/[.18]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate font-semibold tracking-tight text-black dark:text-zinc-50">
          {card.name}
        </h3>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
          <span aria-hidden className="text-amber-500 dark:text-amber-400">
            ★
          </span>
          {card.stars.toLocaleString()}
        </span>
      </div>

      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {card.description || "No description provided."}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {card.events.length > 0 ? (
          card.events.map((event) => (
            <span
              key={event}
              className="rounded-md bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-medium text-blue-700 ring-1 ring-blue-600/10 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-400/10"
            >
              {event}
            </span>
          ))
        ) : (
          <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            Uncategorized
          </span>
        )}
      </div>

      {card.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-black/[.08] px-2 py-0.5 text-xs text-zinc-600 dark:border-white/[.145] dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <InstallSnippet install={card.install} />

      <div className="mt-auto flex items-center justify-between border-t border-black/[.06] pt-3 text-xs text-zinc-500 dark:border-white/[.08] dark:text-zinc-400">
        <a
          href={card.author.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate hover:text-black hover:underline dark:hover:text-zinc-50"
        >
          {card.author.name}
        </a>
        <a
          href={card.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 font-medium text-black hover:underline dark:text-zinc-50"
        >
          View on GitHub
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
            &rarr;
          </span>
        </a>
      </div>
    </article>
  );
}
