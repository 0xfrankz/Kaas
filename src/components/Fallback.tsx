import { CircleX } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';

import { AppError } from '@/lib/error';

import { Button } from './ui/button';

export function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();
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
      <Button
        className="mt-6"
        onClick={() => {
          resetErrorBoundary();
          navigate(-1);
        }}
      >
        Go back
      </Button>
    </div>
  );
}
