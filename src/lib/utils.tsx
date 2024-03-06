import { type ClassValue, clsx } from 'clsx';
import { ErrorBoundary } from 'react-error-boundary';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

import { Fallback } from '@/components/Fallback';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseNumberOrNull(value: unknown): number | null {
  const result = z.coerce.number().safeParse(value);
  if (result.success) {
    return result.data;
  }
  return null;
}

export function errorGuard(component: React.ReactNode) {
  const result = () => {
    return (
      <ErrorBoundary FallbackComponent={Fallback}>{component}</ErrorBoundary>
    );
  };
  return result;
}
