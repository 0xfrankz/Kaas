import { useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import {
  LIST_CONVERSATIONS_KEY,
  LIST_MESSAGES_KEY,
  useMessageCreator,
} from '@/lib/hooks';
import type { ContentItem, Conversation, Message } from '@/lib/types';
import { getTextFromContent } from '@/lib/utils';

import PromptInput from './PromptInput';

type Props = {
  conversation: Conversation;
};

export function SingleChatPromptInput({ conversation }: Props) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const creator = useMessageCreator({
    onSuccess: (msg) => {
      // Update cache
      // Add user message to list
      queryClient.setQueryData<Message[]>(
        [...LIST_MESSAGES_KEY, { conversationId: msg.conversationId }],
        (messages) => (messages ? [...messages, msg] : [msg])
      );
      // Move conversation to top of the list
      queryClient.setQueryData<Conversation[]>(LIST_CONVERSATIONS_KEY, (old) =>
        produce(old, (draft) => {
          const index =
            draft?.findIndex((c) => c.id === msg.conversationId) ?? -1;
          if (index !== -1 && draft) {
            // Move to top
            draft.unshift(draft.splice(index, 1)[0]);
          }
        })
      );
    },
    onSettled: (msg, error) => {
      if (error) {
        toast.error(error.message);
      } else if (msg?.role === MESSAGE_USER) {
        // when the just created message is from user,
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
