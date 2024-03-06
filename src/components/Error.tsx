import { CrossCircledIcon } from '@radix-ui/react-icons';
import type { FallbackProps } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';

import { Button } from './ui/button';

export function Error({ error }: FallbackProps) {
  const navigate = useNavigate();
  const errMsg = error.message ?? 'Unknown Error!';
  return (
    <div className="flex grow flex-col items-center justify-center bg-red-50">
      <CrossCircledIcon className="size-20 text-red-500" />
      <div className="mt-6 text-lg">{errMsg}</div>
      <Button className="mt-6" onClick={() => navigate(-1)}>
        Go back
      </Button>
    </div>
  );
}
