import { parseManifest } from "./manifest";
import type {
  GithubRepoResponse,
  GithubSearchResponse,
  HookCardData,
  RateLimitInfo,
} from "./types";

/**
 * Open discovery: any public repo tagged with this GitHub topic is
 * eligible. Repo owners opt in themselves — no fixed list to maintain.
 */
export const SEARCH_TOPIC = "claude-code-hook";

/** No pagination in v1 — only the first page of results is fetched. */
export const SEARCH_PER_PAGE = 30;

export function buildManifestUrl(owner: string, repo: string, defaultBranch: string): string {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/hookhub.json`;
}

function readRateLimitHeaders(res: Response): RateLimitInfo | undefined {
  const remaining = res.headers.get("x-ratelimit-remaining");
  const reset = res.headers.get("x-ratelimit-reset");
  if (remaining === null || reset === null) return undefined;
  const remainingNum = Number(remaining);
  const resetNum = Number(reset);
  if (Number.isNaN(remainingNum) || Number.isNaN(resetNum)) return undefined;
  return { remaining: remainingNum, resetAt: resetNum * 1000 };
}

type SearchFetchResult =
  | { kind: "ok"; data: GithubSearchResponse; rateLimit?: RateLimitInfo }
  | { kind: "rate-limited"; rateLimit?: RateLimitInfo }
  | { kind: "failed"; rateLimit?: RateLimitInfo };

/**
 * Single call, capped at SEARCH_PER_PAGE results. This is the binding
 * rate-limit risk in the app: the unauthenticated Search API allows only
 * 10 req/min, far tighter than the 60 req/hr general REST budget.
 */
export async function searchHookRepos(): Promise<SearchFetchResult> {
  const url = `https://api.github.com/search/repositories?q=topic:${SEARCH_TOPIC}&sort=stars&order=desc&per_page=${SEARCH_PER_PAGE}`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  const rateLimit = readRateLimitHeaders(res);

  if (res.status === 403) return { kind: "rate-limited", rateLimit };
  if (!res.ok) return { kind: "failed", rateLimit };

  const data = (await res.json()) as GithubSearchResponse;
  return { kind: "ok", data, rateLimit };
}

async function fetchManifest(owner: string, repo: string, defaultBranch: string) {
  try {
    const res = await fetch(buildManifestUrl(owner, repo, defaultBranch));
    if (!res.ok) return null; // 404 (no manifest) is the expected common case
    const json = await res.json();
    return parseManifest(json);
  } catch {
    // malformed JSON or network failure — treated identically to "missing manifest"
    return null;
  }
}

function buildCard(
  data: GithubRepoResponse,
  manifest: ReturnType<typeof parseManifest>,
): HookCardData {
  return {
    id: data.full_name,
    name: data.name,
    description: data.description ?? "",
    repoUrl: data.html_url,
    stars: data.stargazers_count,
    author: manifest?.author ?? {
      name: data.owner.login,
      url: data.owner.html_url,
      avatarUrl: data.owner.avatar_url,
    },
    events: manifest?.events ?? [],
    tags: manifest?.tags ?? [],
    install: manifest?.install,
    hasManifest: manifest !== null,
  };
}

export interface FetchAndMergeResult {
  cards: HookCardData[];
  // "ok" covers a successful search that found zero tagged repos — that's a
  // legitimate empty-discovery result, distinct from "rate-limited"/"failed"
  // (the search call itself not completing). Callers must not conflate them.
  outcome: "ok" | "rate-limited" | "failed";
  rateLimit?: RateLimitInfo;
}

/**
 * Discovery + manifest fetch: one topic-search call, then up to
 * SEARCH_PER_PAGE manifest fetches (via the uncounted raw.githubusercontent.com
 * CDN) fanned out in parallel over whatever repos the search returned.
 */
export async function fetchAndMergeAll(): Promise<FetchAndMergeResult> {
  const searchResult = await searchHookRepos();

  if (searchResult.kind === "rate-limited") {
    return { cards: [], outcome: "rate-limited", rateLimit: searchResult.rateLimit };
  }
  if (searchResult.kind === "failed") {
    return { cards: [], outcome: "failed", rateLimit: searchResult.rateLimit };
  }

  const repos = searchResult.data.items;

  const manifestResults = await Promise.allSettled(
    repos.map((repo) => fetchManifest(repo.owner.login, repo.name, repo.default_branch)),
  );

  const cards = repos.map((repo, i) => {
    const manifestResult = manifestResults[i];
    const manifest = manifestResult.status === "fulfilled" ? manifestResult.value : null;
    return buildCard(repo, manifest);
  });

  return { cards, outcome: "ok", rateLimit: searchResult.rateLimit };
}
