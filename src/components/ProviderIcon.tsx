import { forwardRef, type HTMLAttributes } from 'react';

import type { AllProviders } from '@/lib/types';
import { cn, getProviderStyles } from '@/lib/utils';

type Attrs = HTMLAttributes<HTMLImageElement> & {
  provider: AllProviders;
};

export const ProviderIcon = forwardRef<HTMLImageElement, Attrs>(
  ({ provider, className, ...prop }, ref) => {
    const styles = getProviderStyles(provider);
    return (
      <img
        ref={ref}
        src={`/public/images/${styles.icon}`}
        alt={provider}
        className={cn('m-auto size-[14px]', className)}
        {...prop}
      />
    );
  }
);
