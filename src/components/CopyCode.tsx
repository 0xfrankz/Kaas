import { Check, Copy } from 'lucide-react';
import React, { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import type { ButtonProps } from './ui/button';
import { Button } from './ui/button';

interface CopyCodeProps extends ButtonProps {
  onClick: () => void;
}

export const CopyCode = forwardRef<HTMLButtonElement, CopyCodeProps>(
  ({ onClick, className, ...props }, ref) => {
    const [isCopied, setIsCopied] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
      if (isCopied) {
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      }
    }, [isCopied]);

    return (
      <Button
        ref={ref}
        className={`flex max-h-6 items-start gap-1 overflow-hidden px-2 py-1 text-xs ${className}`}
        variant="outline"
        onClick={() => {
          setIsCopied(true);
          onClick();
        }}
        {...props}
      >
        <div
          className={cn(
            'flex flex-col gap-1 transition-transform',
            isCopied ? '-translate-y-[18px]' : 'translate-y-0'
          )}
        >
          <div className="flex h-[14px] items-center gap-1">
            <Copy className="size-[14px]" />
          </div>
          <div className="flex h-[14px] items-center justify-center">
            <Check className="size-[14px]" />
          </div>
        </div>
      </Button>
    );
  }
);
