import { Network } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useProxySetting } from '@/lib/hooks';
import { cn } from '@/lib/utils';

import { OnOffIndicator } from './OnOffIndicator';

export function ProxyIndicator({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const [proxySetting] = useProxySetting();
  const { t } = useTranslation(['generic']);
  const onOffKey = proxySetting.on ? 'generic:label:on' : 'generic:label:off';
  return (
    <div
      className={cn(
        'flex items-center text-xs text-muted-foreground',
        className
      )}
      {...props}
    >
      <Tooltip>
        <TooltipTrigger>
          <div className="flex h-6 items-center rounded-full border-2 bg-background px-2">
            <Network className="size-[14px]" />
            <OnOffIndicator on={proxySetting.on} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <span>{`${t('generic:label:proxy')} ${t(onOffKey)}`}</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
