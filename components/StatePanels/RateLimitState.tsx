import { useRateLimitInfo } from "@/hooks/useRateLimitInfo";
import type { RateLimitInfo } from "@/lib/types";

export default function RateLimitState({
  rateLimit,
  onRetry,
  retryDisabled,
}: {
  rateLimit?: RateLimitInfo;
  onRetry: () => void;
  retryDisabled?: boolean;
}) {
  const info = useRateLimitInfo(rateLimit);

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-amber-300 py-16 text-center dark:border-amber-900">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        GitHub&apos;s unauthenticated rate limit has been hit for this network.
        {info ? ` Next refresh available around ${info.resetLabel}.` : ""}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retryDisabled}
        className="rounded-full border border-black/[.08] px-3 py-1 text-sm font-medium text-zinc-700 hover:border-black/20 disabled:opacity-50 dark:border-white/[.145] dark:text-zinc-300"
      >
        Try again
      </button>
    </div>
  );
}
