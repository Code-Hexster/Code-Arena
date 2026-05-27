import { clsx, type ClassValue } from "clsx";

// Simple clsx reimplementation to avoid adding another dependency
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Delay helper for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format a number with commas (e.g. 1,000)
 */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/**
 * Get relative time string (e.g. "2 hours ago")
 */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return "just now";
}
