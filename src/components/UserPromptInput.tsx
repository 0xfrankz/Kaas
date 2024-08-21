import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useMessageCreator,
  useMessageListContext,
} from '@/lib/hooks';
import type { ContentItem, ConversationDetails, Message } from '@/lib/types';
import { getTextFromContent } from '@/lib/utils';

import PromptInput from './PromptInput';

type Props = {
  conversation: ConversationDetails;
};

export function UserPromptInput({ conversation }: Props) {
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
          conversationId: conversation.id,
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
              conversationId: conversation.id,
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
          conversationId: conversation.id,
          role: MESSAGE_USER,
          content,
        });
      }
    },
    [conversation.id, creator, t]
  );

  return (
    <div className="relative size-full">
      <PromptInput
        onSubmit={onSubmit}
        placeHolder={t('page-conversation:message:input-placeholder')}
        conversation={conversation}
      />
    </div>
  );
}
