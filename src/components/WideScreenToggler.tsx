import { ChevronsLeftRight, ChevronsRightLeft } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';

interface WideScreenTogglerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  wide?: boolean;
  onWideScreenChange: (wideScreen: boolean) => void;
}

export const WideScreenToggler = React.forwardRef<
  HTMLButtonElement,
  WideScreenTogglerProps
>(({ wide = false, className, onWideScreenChange, ...props }, ref) => {
  const [isWide, setIsWide] = useState(wide);
  return (
    <Button
      className={cn(
        'flex h-6 items-center rounded-full border-2 bg-background px-2 text-muted-foreground shadow-none hover:bg-background',
        className
      )}
      ref={ref}
      {...props}
      onClick={() => {
        setIsWide((old) => {
          onWideScreenChange(!old);
          return !old;
        });
      }}
    >
      {isWide ? (
        <ChevronsRightLeft className="size-[14px]" />
      ) : (
        <ChevronsLeftRight className="size-[14px]" />
      )}
    </Button>
  );
});

WideScreenToggler.displayName = 'WideScreenToggler';
