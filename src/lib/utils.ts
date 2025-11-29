import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format numbers removing trailing .0 or .00 while preserving decimals when needed
export function formatNumberCompact(value: number | string | undefined | null) {
  if (value === null || value === undefined) return "";
  const n = Number(value as any);
  if (Number.isNaN(n)) return String(value);
  // Convert to string and remove trailing zeros after decimal
  let s = String(n);
  if (s.indexOf(".") >= 0) {
    s = s.replace(/\.0+$/, "");
    s = s.replace(/(\.[0-9]*[1-9])0+$/, "$1");
  }
  return s;
}
