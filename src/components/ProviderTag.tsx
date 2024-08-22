import { useTheme } from 'next-themes';
import { forwardRef, type HTMLAttributes } from 'react';

import type { AllProviders } from '@/lib/types';
import { cn, getProviderStyles } from '@/lib/utils';

import { ProviderIcon } from './ProviderIcon';

type Attrs = HTMLAttributes<HTMLDivElement> & {
  provider: AllProviders;
  showText?: boolean;
};
export const ProviderTag = forwardRef<HTMLDivElement, Attrs>(
  ({ provider, showText = true, className, ...prop }, ref) => {
    const { theme } = useTheme();
    const styles = getProviderStyles(provider);
    return (
      <div
        ref={ref}
        className={cn(
          'text-xs flex h-6 items-center px-2 gap-2 w-fit rounded-full bg-background border-2',
          className
        )}
        {...prop}
        style={{
          borderColor:
            theme === 'light' ? styles.color.light : styles.color.dark,
        }}
      >
        <ProviderIcon provider={provider} />
        {showText ? provider : null}
      </div>
    );
  }
);
