import { SquareTerminal } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetSystemMessageQuery } from '@/lib/hooks';
import type { ConversationDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

import { OnOffIndicator } from './OnOffIndicator';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function SystemMessageIndicator({
  conversation,
  className,
  onClick,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  onClick: () => void;
  conversation: ConversationDetails;
}) {
  const { t } = useTranslation();
  const { data } = useGetSystemMessageQuery({
    conversationId: conversation.id,
  });
  const onOffKey = data ? 'generic:label:set' : 'generic:label:not-set';
  return (
    <div
      className={cn(
        'flex items-center text-xs text-muted-foreground',
        className
      )}
      {...props}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="flex h-6 items-center rounded-full border-2 bg-background px-2 text-muted-foreground shadow-none hover:bg-background"
            onClick={onClick}
          >
            <SquareTerminal className="size-[14px]" />
            <OnOffIndicator on={!!data} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>{`${t('generic:label:system-message')} ${t(onOffKey)}`}</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
