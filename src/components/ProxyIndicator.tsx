import { Network } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center">
              <Network className="size-4" />
              <OnOffIndicator on={proxySetting.on} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <span>{`${t('generic:label:proxy')} ${t(onOffKey)}`}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
