import { useTheme } from 'next-themes';
import { forwardRef, type HTMLAttributes } from 'react';

import type { SupportedProviders } from '@/lib/types';
import { cn, getProviderStyles } from '@/lib/utils';

type Attrs = HTMLAttributes<HTMLDivElement> & { provider: SupportedProviders };
export const ProviderTag = forwardRef<HTMLDivElement, Attrs>(
  ({ provider, className, ...prop }, ref) => {
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
        <img
          src={`/public/images/${styles.icon}`}
          alt={provider}
          className="m-auto size-[14px]"
        />
        {provider}
      </div>
    );
  }
);
