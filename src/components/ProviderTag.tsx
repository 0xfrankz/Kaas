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
        className={cn('text-sm', className)}
        {...prop}
        style={{
          backgroundColor:
            theme === 'light' ? styles.color.light : styles.color.dark,
        }}
      >
        {provider}
      </div>
    );
  }
);
