import { ArrowDown } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';

// export function ToBottom({ onClick }: { onClick: () => void }) {
//   return (
//     <div className="flex h-full items-center justify-center">
//       <Button
//         variant="secondary"
//         className="size-9 rounded-full p-0 drop-shadow-lg"
//         onClick={onClick}
//       >
//         <ArrowDownIcon className="size-4" />
//       </Button>
//     </div>
//   );
// }

export const ToBottom = forwardRef<
  HTMLButtonElement,
  HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <Button
      variant="secondary"
      className={cn('size-9 rounded-full p-0 drop-shadow-lg', className)}
      {...props}
      ref={ref}
    >
      <ArrowDown className="size-4" />
    </Button>
  );
});
