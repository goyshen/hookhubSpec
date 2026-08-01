export const ALL_EVENT_TYPES = [
  "PreToolUse",
  "PostToolUse",
  "Notification",
  "UserPromptSubmit",
  "Stop",
  "SubagentStop",
  "PreCompact",
  "SessionStart",
  "SessionEnd",
  "PostCodeGeneration",
] as const;

export type EventType = (typeof ALL_EVENT_TYPES)[number];

export function isEventType(value: unknown): value is EventType {
  return (ALL_EVENT_TYPES as readonly unknown[]).includes(value);
}

export interface GithubRepoResponse {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  default_branch: string;
  owner: {
    login: string;
    html_url: string;
    avatar_url: string;
  };
}

export interface GithubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepoResponse[];
}

export interface ManifestInstall {
  summary?: string;
  snippet?: string;
  language?: string;
}

export interface ManifestAuthor {
  name: string;
  url: string;
}

export interface Manifest {
  manifestVersion: number;
  events: EventType[];
  tags: string[];
  install?: ManifestInstall;
  author?: ManifestAuthor;
}

export interface HookCardData {
  id: string; // "owner/repo"
  name: string;
  description: string;
  repoUrl: string;
  stars: number;
  author: {
    name: string;
    url: string;
    avatarUrl?: string;
  };
  events: EventType[]; // [] => render as "Uncategorized"
  tags: string[];
  install?: ManifestInstall;
  hasManifest: boolean;
}

export interface RateLimitInfo {
  remaining: number;
  resetAt: number; // epoch ms
}

export type HookReposStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "rate-limited";

export interface HookReposState {
  status: HookReposStatus;
  cards: HookCardData[];
  rateLimit?: RateLimitInfo;
  fetchedAt?: number;
  stale?: boolean;
}
