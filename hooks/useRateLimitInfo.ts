import { useMemo } from "react";
import type { RateLimitInfo } from "@/lib/types";

export interface RateLimitDisplay {
  remaining: number;
  resetAt: number;
  resetLabel: string;
}

/**
 * Formats a RateLimitInfo (raw remaining/resetAt) into UI-ready fields,
 * e.g. "next refresh available at HH:MM".
 */
export function useRateLimitInfo(rateLimit?: RateLimitInfo): RateLimitDisplay | null {
  return useMemo(() => {
    if (!rateLimit) return null;
    const resetDate = new Date(rateLimit.resetAt);
    return {
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt,
      resetLabel: resetDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  }, [rateLimit]);
}
