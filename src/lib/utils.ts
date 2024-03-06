import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseNumberOrNull(value: unknown): number | null {
  const result = z.number().safeParse(value);
  if (result.success) {
    return result.data;
  }
  return null;
}
