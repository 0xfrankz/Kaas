import React, { forwardRef } from 'react';

import type { Model } from '@/lib/types';
import { cn, getModelAlias } from '@/lib/utils';

import { ProviderIcon } from './ProviderIcon';

type MultiModelPickerProps = React.HTMLAttributes<HTMLDivElement> & {
  models: Model[];
};

export const MultiModelPicker = forwardRef<
  HTMLDivElement,
  MultiModelPickerProps
>(({ className, models, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4',
        className
      )}
      {...props}
    >
      {models.map((model) => (
        <div
          key={model.id}
          className="flex flex-col items-center rounded-lg border p-4"
        >
          <ProviderIcon provider={model.provider} />
          <span className="mt-2 text-center text-sm">
            {getModelAlias(model)}
          </span>
        </div>
      ))}
    </div>
  );
});

MultiModelPicker.displayName = 'MultiModelPicker';
