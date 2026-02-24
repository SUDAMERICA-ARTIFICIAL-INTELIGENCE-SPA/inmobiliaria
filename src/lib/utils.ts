import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number): string {
  return `US$ ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function calculateBaths(bathsFull: number, bathsHalf: number): number {
  return bathsFull + bathsHalf * 0.5;
}

export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
