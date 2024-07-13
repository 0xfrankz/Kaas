import { useQueryClient } from '@tanstack/react-query';
import { Coins } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useMessageCreator,
  useMessageListContext,
} from '@/lib/hooks';
import type { ContentItem, Message } from '@/lib/types';
import { getTextFromContent } from '@/lib/utils';

import PromptInput from './PromptInput';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const HEIGHT_LIMIT = 20 * 20;

type Props = {
  conversationId: number;
};

export function UserPromptInput({ conversationId }: Props) {
  const queryClient = useQueryClient();
  const { messages } = useMessageListContext();
  const { t } = useTranslation();

  const totalUsage = messages.reduce((acc, msg) => {
    return acc + (msg.totalToken ?? 0);
  }, 0);

  const creator = useMessageCreator({
    onSettled: (_, error) => {
      if (error) {
        toast.error(error.message);
      } else {
        // insert placeholder to trigger generation
        const placeholder: Message = {
          conversationId,
          role: MESSAGE_BOT,
          content: [],
          id: -1,
          isReceiving: true,
        };
        // add placeholder message
        queryClient.setQueryData<Message[]>(
          [
            ...LIST_MESSAGES_KEY,
            {
              conversationId,
            },
          ],
          (old) => {
            return old ? [...old, placeholder] : [placeholder];
          }
        );
      }
    },
  });

  // Callbacks

  const onSubmit = useCallback(
    async (content: ContentItem[]) => {
      const promptStr = getTextFromContent(content);
      if (promptStr.trim().length === 0) {
        toast.error(t('error:validation:empty-prompt'));
      } else {
        creator({
          conversationId,
          role: MESSAGE_USER,
          content,
        });
      }
    },
    [conversationId, creator, t]
  );

  return (
    <div className="relative size-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="absolute -top-6 right-4 overflow-hidden rounded-t bg-muted px-2 py-1 text-muted-foreground">
            <div className="ml-auto flex items-center gap-1 text-xs">
              <Coins className="size-[14px]" />
              {totalUsage}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span>
            {t('page-conversation:message:total-token-usage', {
              totalUsage,
            })}
          </span>
        </TooltipContent>
      </Tooltip>
      <PromptInput
        onSubmit={onSubmit}
        placeHolder={t('page-conversation:message:input-placeholder')}
      />
    </div>
  );
}
