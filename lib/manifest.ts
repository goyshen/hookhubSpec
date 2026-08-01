import { isEventType, type EventType, type Manifest, type ManifestAuthor, type ManifestInstall } from "./types";

const MAX_TAGS = 10;

export function validateEvents(input: unknown): EventType[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isEventType);
}

function parseTags(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .slice(0, MAX_TAGS);
}

function parseInstall(input: unknown): ManifestInstall | undefined {
  if (typeof input !== "object" || input === null) return undefined;
  const obj = input as Record<string, unknown>;
  const install: ManifestInstall = {};
  if (typeof obj.summary === "string") install.summary = obj.summary;
  if (typeof obj.snippet === "string") install.snippet = obj.snippet;
  if (typeof obj.language === "string") install.language = obj.language;
  return Object.keys(install).length > 0 ? install : undefined;
}

function parseAuthor(input: unknown): ManifestAuthor | undefined {
  if (typeof input !== "object" || input === null) return undefined;
  const obj = input as Record<string, unknown>;
  if (typeof obj.name !== "string" || typeof obj.url !== "string") return undefined;
  return { name: obj.name, url: obj.url };
}

/**
 * Parses a raw `hookhub.json` payload. Every field is optional and invalid
 * values are dropped individually rather than failing the whole manifest —
 * one bad field shouldn't sink the card.
 */
export function parseManifest(json: unknown): Manifest | null {
  if (typeof json !== "object" || json === null) return null;
  const obj = json as Record<string, unknown>;

  const manifestVersion = typeof obj.manifestVersion === "number" ? obj.manifestVersion : 1;

  return {
    manifestVersion,
    events: validateEvents(obj.events),
    tags: parseTags(obj.tags),
    install: parseInstall(obj.install),
    author: parseAuthor(obj.author),
  };
}
