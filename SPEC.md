# HookHub — Specification (revised)

## Context

Claude Code supports lifecycle hooks (`PreToolUse`, `PostToolUse`, `Notification`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `PreCompact`, `SessionStart`, `SessionEnd`, and — new in this revision — `PostCodeGeneration`) that let users wire custom scripts into the agent's workflow. As the ecosystem grows, community-built hooks are scattered across individual GitHub repos with no central directory. HookHub addresses this by discovering hook repos via GitHub topic search, rendering them as browsable cards, and letting visitors filter by which event(s) a hook implements.

The project directory is currently empty; this is a greenfield build.

This revision supersedes the prior draft in two ways, and reaffirms open discovery after briefly reconsidering (and rejecting) a closed 3-repo set (confirmed with user):
1. **Home page display is a card grid, not a carousel.** Any carousel-style presentation is explicitly rejected in favor of a responsive grid of cards.
2. **A new hook event is added**: `PostCodeGeneration` — fires after Claude Code finishes generating code (as distinct from the general-purpose `PostToolUse`). This is a HookHub-defined event for filtering/cataloging purposes; flagged as non-official (the real Claude Code hook lifecycle does not currently define it) in case a different name or an existing official event was actually intended.

**Discovery is open GitHub topic search, not a closed set.** A closed 3-repo list was considered mid-revision and then reverted (confirmed with user): discovery instead queries the GitHub Search API for public repos tagged with the `claude-code-hook` topic. Any repo owner can opt in by adding that topic — no fixed list to maintain or redeploy, no manifest required for basic discoverability.

## Key Decisions (confirmed with user)

1. **Discovery — open GitHub topic search.** Query the GitHub Search API for public repos tagged with the `claude-code-hook` topic:

   ```
   GET https://api.github.com/search/repositories?q=topic:claude-code-hook&sort=stars&order=desc&per_page=30
   ```

   This is a live, growing result set — not a fixed/seed list. Any repo owner can opt in simply by adding the `claude-code-hook` topic to their repo; no submission process, no editing a hardcoded list, no redeploy. Only the **first page (capped at 30 results, no pagination)** is fetched in v1. No manifest required for a repo to appear; a repo missing `hookhub.json` still renders using GitHub metadata only, with "Uncategorized" fields.
2. **Structured metadata** (event types, tags, install snippet): comes from an optional `hookhub.json` manifest file at each repo's root. Repos without one still render, using GitHub metadata only.
3. **API strategy**: fully client-side, unauthenticated GitHub API calls — no backend, no server secrets. Discovery uses the **Search API** (`GET /search/repositories`), which carries a much stricter unauthenticated limit (**10 req/min**) than the general REST API (60 req/hr) used for manifest-adjacent lookups — treated as the binding rate-limit constraint for this app (see States to Design For).
4. **Stack**: Next.js (App Router), static export (`output: 'export'`), Tailwind CSS.
5. **Filter set**: 10 hook events — the 9 official Claude Code hook events listed in Context, plus the new `PostCodeGeneration` event.
6. **Card fields**: name, description, GitHub link, event type(s), stars/repo stats, author, install/usage snippet, tags.
7. **Home page layout: card grid, not carousel.** Responsive CSS grid — 3 columns desktop, 2 tablet, 1 mobile. No swipeable/scrolling carousel component anywhere in the MVP.

## Manifest Schema (`hookhub.json`, repo root)

```json
{
  "manifestVersion": 1,
  "events": ["PreToolUse", "PostToolUse", "PostCodeGeneration"],
  "tags": ["security", "linting"],
  "install": {
    "summary": "Add to .claude/settings.json under hooks.PreToolUse",
    "snippet": "<hook config snippet as a plain string>",
    "language": "json"
  },
  "author": { "name": "Jane Doe", "url": "https://github.com/janedoe" }
}
```

- `manifestVersion` — integer; missing/unknown treated as `1` for forward compatibility.
- `events` — validated against the fixed **10-value** enum (9 official + `PostCodeGeneration`) client-side; unrecognized strings are dropped (logged, not fatal) — one bad value shouldn't sink the whole card.
- `tags` — free-form strings, lowercased/trimmed, capped at ~10 to prevent layout abuse.
- `install.snippet` — rendered as inert text in a `<pre>` block; never evaluated/executed.
- `author` — optional; falls back to the GitHub repo owner (login + avatar) from repo metadata when absent.
- Manifest itself optional; if present must be valid JSON, but every field within it is optional (missing `events` → card shows "Uncategorized").

This schema (plus a short "how to list your hook" guide) should ship as a `SCHEMA.md` in the HookHub repo for hook authors to reference: "listing your hook" means (1) adding the `claude-code-hook` topic to the repo so it's discovered at all, and (2) optionally adding `hookhub.json` for structured metadata instead of the GitHub-only fallback fields.

## Data-Fetching Flow

**1. Discovery — single GitHub Search API call, capped at one page:**
```
GET https://api.github.com/search/repositories?q=topic:claude-code-hook&sort=stars&order=desc&per_page=30
```
One call, no pagination beyond the first `per_page=30` page — the result set grows organically as repo owners add the `claude-code-hook` topic, not from a hardcoded list. Each search result item is already a full repo object (stars, description, owner avatar, `default_branch`), so no extra per-repo REST calls are needed to resolve those fields. This is the opposite of the closed-set approach briefly considered mid-revision: no `DISCOVERY_REPOS` constant, an open (page-capped) set of contributor-tagged repos instead.

This single call is also the binding rate-limit risk in the whole flow: the unauthenticated Search API allows only **10 req/min** (vs. 60 req/hr for other REST endpoints), so it takes far less activity — e.g. a handful of rapid manual "Refresh" clicks — to hit `RateLimitState` than under the old fixed-repo design. See States to Design For.

**2. Manifest fetch — via `raw.githubusercontent.com`, not the REST contents endpoint (unchanged):**
```
https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/hookhub.json
```
- `default_branch` comes from each search result item in step 1 — zero extra calls to determine it.
- Not counted against either REST budget, unlike `/repos/{owner}/{repo}/contents/{path}`.
- A 404 (no manifest) is the expected common case — handled silently, card falls back to GitHub-only fields.
- Fetched in parallel via `Promise.allSettled` for every repo returned by step 1 (up to the 30-result cap); malformed JSON or network failure per-repo is treated identically to "missing manifest" — never blocks the other cards.

**3. Caching (localStorage) — now the primary rate-limit mitigation, not just a nicety:**
- Cache the fully merged result (repo metadata + manifest, for every discovered repo) under a versioned key (e.g. `hookhub:cache:v1`) with a `fetchedAt` timestamp.
- TTL: 1 hour by default.
- No automatic background revalidation — only refetch on TTL expiry-on-load or an explicit user "Refresh" action (cooldown-gated, e.g. 60s). The cooldown is the main defense against burning the 10 req/min search budget via refresh-spamming.
- Also serves the original purpose of snappy repeat loads and offline/flaky-network resilience.

## Component / File Structure (Next.js App Router, static export)

```
next.config.ts                 # output: 'export'
app/
  layout.tsx
  page.tsx                     # 'use client' boundary for data-fetching tree
  globals.css
lib/
  github.ts                    # SEARCH_TOPIC constant, searchHookRepos(), buildManifestUrl()
  manifest.ts                  # parseManifest(), validateEvents(), safe-parse wrapper
  cache.ts                     # readCache(), writeCache(), isStale(), TTL constants
  types.ts                     # Repo, Manifest, HookCardData, EventType union (10 values)
hooks/
  useHookRepos.ts              # orchestrates fetch + cache + merge; {data, status, error, refresh}
  useRateLimitInfo.ts          # surfaces remaining/reset for UI messaging
components/
  HookGrid.tsx                 # CSS grid layout — 3/2/1 responsive columns; no carousel
  HookCard.tsx                 # name, description, stars, author, tags, events, install snippet, GH link
  FilterBar.tsx                # multi-select chips for the 10 event types
  InstallSnippet.tsx           # <pre>/code block + copy-to-clipboard
  StatePanels/
    LoadingSkeleton.tsx
    EmptyState.tsx             # zero results after filtering
    ErrorState.tsx             # network failure
    RateLimitState.tsx         # 403/rate-limit messaging with reset countdown
```

`useHookRepos` is the core orchestrator: check cache → if fresh, hydrate synchronously; if stale/absent, run the topic search (one call), fan out one manifest fetch per result (up to the 30-result cap), merge, write cache, update state. Exposes `status: 'idle' | 'loading' | 'success' | 'error' | 'rate-limited'` and a cooldown-gated `refresh()`.

## State Management

Plain React state — single data source (search-result repos, variable count up to the 30-result cap), single consumer tree, no cross-route sharing, no server mutations. No Redux/Zustand/React Query needed. Active filter selection is `useState<Set<EventType>>` (now a 10-value union) lifted to the page component; the filtered view is a derived `useMemo` over the fetched list.

## Styling

Tailwind CSS, rendering the grid described in Key Decision #7 — 3 columns desktop / 2 tablet / 1 mobile via `grid-cols-*` responsive classes. No carousel/scroll-snap library or component.

## States to Design For

- **Initial load**: card-shaped skeletons while the search call + its fan-out manifest fetches are in flight.
- **Rate limit exceeded**: treated as a **commonly-expected state, not a rare edge case** — the Search API's 10 req/min unauthenticated limit is easy to hit (a few rapid manual refreshes across tabs/users on shared network is enough). Distinct from generic errors — show reset time from cached headers; prefer stale-cache display over a blank screen when available.
- **Three distinct empty/error states, not to be conflated**: (a) **zero results after filtering** (some event filter selected, no card matches — cards exist, filter excludes them all); (b) **zero repos returned by the topic search itself** (no repos currently tagged `claude-code-hook` — discovery isn't guaranteed non-empty the way a fixed list was); (c) **the search call fails outright** (network/rate-limit), surfaced via `ErrorState`/`RateLimitState` rather than an empty grid.
- **Network failure / GitHub outage**: generic retry panel, visually distinct from the rate-limit state.
- **Partial manifest failure**: silent per-card fallback to "Uncategorized" — not a page-level state.

### Establishing the Starting Point
This demo begins from the
`project/hookhub`
branch at commit:
<insert commit hash here>
To reproduce the starting state:
git checkout project/hookhub
git reset --hard <commit-hash>
npm install
npm run dev

## Known Risks / Limitations (accepted for v1)

- **Topic self-tagging / spam risk**: since any repo owner can add the `claude-code-hook` topic, unrelated or low-quality repos can self-list with no curation gate beyond GitHub's own search ranking (sorted by stars). Accepted tradeoff for v1 — a manual allow/deny-list is a possible future mitigation, not planned for v1.
- **Search rate limit is easily exhausted by refresh-spamming**: 10 req/min unauthenticated is far tighter than a REST-only design would face; the cooldown-gated Refresh button (see Caching) is the primary mitigation, and `RateLimitState` is designed as a commonly-hit state rather than a rare edge case.
- **30-result cap, no pagination**: repos tagged `claude-code-hook` beyond the first page (by star-sort) are invisible in v1. Accepted tradeoff — pagination is a possible future direction, not planned for v1.
- **`PostCodeGeneration` is not an official Claude Code hook event** — it's a HookHub-specific addition to the filter taxonomy. If a manifest declares it, HookHub will filter on it, but Claude Code itself won't fire it unless/until it exists in the real product.
- **CORS**: both `api.github.com` and `raw.githubusercontent.com` send permissive CORS headers for GET requests — this is what makes the fully client-side architecture viable at all.
- **Stale cached manifest after a repo's default branch is renamed**: self-corrects on next TTL expiry; not worth special-case handling.

## Critical Files to Create

- `lib/github.ts` (holds the `SEARCH_TOPIC` constant and `searchHookRepos()` topic-search call, not a fixed `DISCOVERY_REPOS` list), `lib/manifest.ts`, `lib/cache.ts`, `lib/types.ts`
- `hooks/useHookRepos.ts`
- `components/HookCard.tsx`, `components/FilterBar.tsx`, `components/HookGrid.tsx` (grid layout, not carousel)
- `next.config.ts` (static export config)

## Verification Plan

1. `npm run build` succeeds with `output: 'export'` producing a static `out/` directory; serve it locally (e.g. `npx serve out`) and confirm no server-side errors.
2. Manually verify against real GitHub data: tag at least two test repos with the `claude-code-hook` topic — one with a valid `hookhub.json` (including a `PostCodeGeneration` entry in `events`), one without — and confirm the topic search picks up both, rendering full metadata vs. "Uncategorized" fallback respectively.
3. Exercise filter UI: select/deselect all 10 event types including `PostCodeGeneration`, confirm the grid updates via the derived `useMemo` and the "zero results after filtering" empty state appears when no hook matches the selection.
4. Confirm the home page renders as a responsive grid (3/2/1 columns by breakpoint) with no carousel/swipe behavior at any viewport width.
5. Force cache/rate-limit states in dev tools: clear localStorage to test the loading skeleton; mock a 403 response to confirm `RateLimitState` renders with reset time; corrupt a manifest response to confirm silent per-card fallback (no console-visible crash, card still renders).
6. Confirm the "Refresh" button is cooldown-gated (disabled/no-op if clicked again within the cooldown window).
7. Confirm the three discovery-empty/error states render distinctly: mock a topic search returning zero items (empty-discovery state, not the same UI as "zero results after filtering"), a 403 from the search endpoint (`RateLimitState`), and a network failure on the search call (`ErrorState`).
