import { SquareTerminal } from 'lucide-react';
import type { HTMLAttributes } from 'react';

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
  const { data } = useGetSystemMessageQuery({
    conversationId: conversation.id,
  });
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
            className="flex h-6 items-center rounded-full border-2 bg-background px-2 text-muted-foreground hover:bg-background"
            onClick={onClick}
          >
            <SquareTerminal className="size-[14px]" />
            <OnOffIndicator on={!!data} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>System message not set</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
