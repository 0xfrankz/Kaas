import { Pin as PinIcon } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';

interface PinProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pinned?: boolean;
  onPinnedChange: (pinned: boolean) => void;
}

export const Pin = React.forwardRef<HTMLButtonElement, PinProps>(
  ({ pinned = false, className, onPinnedChange, ...props }, ref) => {
    const [isPinned, setIsPinned] = useState(pinned);
    return (
      <Button
        ref={ref}
        className={className}
        variant="ghost"
        {...props}
        onClick={() => {
          setIsPinned((old) => {
            onPinnedChange(!old);
            return !old;
          });
        }}
      >
        <PinIcon className={cn('size-[14px]', isPinned && 'fill-current')} />
      </Button>
    );
  }
);

Pin.displayName = 'Pin';
