import { Coins } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useListMessagesQuery } from '@/lib/hooks';
import type { ConversationDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export const UsageCounter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { conversation: ConversationDetails }
>(({ className, conversation, ...props }, ref) => {
  const { data: messages } = useListMessagesQuery(conversation.id);
  const { t } = useTranslation();
  const totalUsage =
    messages?.reduce((acc, msg) => {
      return acc + (msg.totalToken ?? 0);
    }, 0) ?? 0;

  return (
    <div
      ref={ref}
      className={cn('flex items-center text-xs', className)}
      {...props}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex h-6 items-center rounded-full border-2 bg-background px-2">
            <div className="ml-auto flex items-center gap-1 text-xs">
              <Coins className="size-[14px] text-muted-foreground" />
              <span>{totalUsage}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>
            {t('page-conversation:message:total-token-usage', {
              totalUsage,
            })}
          </span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
});
