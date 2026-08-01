"use client";

import { useState } from "react";
import type { ManifestInstall } from "@/lib/types";

export default function InstallSnippet({ install }: { install?: ManifestInstall }) {
  const [copied, setCopied] = useState(false);

  if (!install?.snippet) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(install.snippet!);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard permission denied — non-fatal, user can still select/copy manually
    }
  };

  return (
    <div className="mt-3">
      {install.summary && (
        <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">{install.summary}</p>
      )}
      <div className="relative">
        <pre className="max-h-32 overflow-auto rounded-md bg-zinc-100 p-2 pr-14 text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <code>{install.snippet}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-1.5 right-1.5 rounded border border-black/[.08] bg-white/90 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-white dark:border-white/[.145] dark:bg-black/70 dark:text-zinc-200 dark:hover:bg-black"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
