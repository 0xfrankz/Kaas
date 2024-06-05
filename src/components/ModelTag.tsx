import { useTheme } from 'next-themes';
import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { Model } from '@/lib/types';
import { cn, getModelAlias, getProviderStyles } from '@/lib/utils';

import { ProviderIcon } from './ProviderIcon';

type Attrs = HTMLAttributes<HTMLDivElement> & {
  model?: Model;
};

const NormalModelTag = forwardRef<
  HTMLDivElement,
  Omit<Attrs, 'model'> & Required<Pick<Attrs, 'model'>>
>(({ model, className, ...prop }, ref) => {
  const { theme } = useTheme();
  const styles = getProviderStyles(model.provider);
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-6 items-center px-2 gap-2 w-fit rounded-full bg-background border-2',
        className
      )}
      {...prop}
      style={{
        borderColor: theme === 'light' ? styles.color.light : styles.color.dark,
      }}
    >
      <ProviderIcon provider={model.provider} />
      <span className="max-w-24 truncate text-xs">{getModelAlias(model)}</span>
    </div>
  );
});

const UnknownModelTag = forwardRef<HTMLDivElement, Omit<Attrs, 'model'>>(
  ({ className, ...prop }, ref) => {
    const { t } = useTranslation();
    return (
      <div
        ref={ref}
        className={cn(
          'text-xs flex h-6 items-center px-2 gap-2 w-fit rounded-full bg-background border-2 border-muted',
          className
        )}
        {...prop}
      >
        {t('generic:model:unknown')}
      </div>
    );
  }
);

export const ModelTag = forwardRef<HTMLDivElement, Attrs>(
  ({ model, className, ...prop }, ref) => {
    return model ? (
      <NormalModelTag {...prop} className={className} model={model} ref={ref} />
    ) : (
      <UnknownModelTag {...prop} className={className} ref={ref} />
    );
  }
);
