import { CircleX } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';

import { AppError } from '@/lib/error';

export function GlobalFallback({ error }: FallbackProps) {
  let errMsg;
  let errReason;
  if (error instanceof AppError) {
    errMsg = error.displayMessage;
    errReason = `${error.type}: ${error.message}`;
  } else {
    errMsg = error.message ?? 'Unknown Error';
    errReason = null;
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <CircleX className="size-20 text-red-500" />
      <div className="mt-6 max-w-screen-sm text-lg">{errMsg}</div>
      {errReason && (
        <div className="mt-2 max-w-screen-sm text-sm">{errReason}</div>
      )}
    </div>
  );
}
