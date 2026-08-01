import type { HookCardData } from "@/lib/types";
import InstallSnippet from "./InstallSnippet";

export default function HookCard({ card }: { card: HookCardData }) {
  return (
    <article className="flex flex-col rounded-lg border border-black/[.08] bg-white p-4 shadow-sm dark:border-white/[.145] dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-black dark:text-zinc-50">{card.name}</h3>
        <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
          ★ {card.stars.toLocaleString()}
        </span>
      </div>

      <p className="mt-1 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
        {card.description || "No description provided."}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {card.events.length > 0 ? (
          card.events.map((event) => (
            <span
              key={event}
              className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            >
              {event}
            </span>
          ))
        ) : (
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
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

      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-zinc-500 dark:text-zinc-400">
        <a
          href={card.author.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {card.author.name}
        </a>
        <a
          href={card.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-black hover:underline dark:text-zinc-50"
        >
          View on GitHub &rarr;
        </a>
      </div>
    </article>
  );
}
