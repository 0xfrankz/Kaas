import { useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { memo, useCallback, useMemo, useRef } from 'react';

import { MESSAGE_BOT } from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useBotCaller,
  useListMessagesQuery,
} from '@/lib/hooks';
import { MessageListContextProvider } from '@/lib/providers';
import type { Conversation, Message } from '@/lib/types';
import { getMessageTag } from '@/lib/utils';

import { ChatMessageList } from '../ChatMessageList';
import { ScrollBottom } from '../ScrollBottom';
import { ScrollArea } from '../ui/scroll-area';

const MemoizedMessageList = memo(ChatMessageList);
const MemoizedScrollBottom = memo(ScrollBottom);

export function Chat({ conversation }: { conversation: Conversation }) {
  const viewportRef = useRef<HTMLDivElement>(null);

  // Queries
  const queryClient = useQueryClient();
  const { data: messages, isSuccess } = useListMessagesQuery(conversation.id);
  const botCaller = useBotCaller();

  // Derived states
  const messagesWithModelId = useMemo(() => {
    return (
      messages?.map((msg) => {
        return {
          ...msg,
          modelId: msg.modelId ? msg.modelId : conversation.modelId,
        };
      }) ?? []
    );
  }, [conversation.modelId, messages]);

  // Callbacks
  const onReceiverReady = useCallback(() => {
    const placeholder = messages?.find((m) => m.isReceiving);
    if (placeholder) {
      // listener's tag
      const tag = getMessageTag(placeholder);
      const data = {
        conversationId: conversation.id,
        tag,
        beforeMessageId: placeholder.id > 0 ? placeholder.id : undefined,
      };
      botCaller(data);
    }
  }, [messages, botCaller, conversation.id]);

  const onRegenerateClick = useCallback(
    (msg: Message) => {
      // set message to receive
      queryClient.setQueryData<Message[]>(
        [
          ...LIST_MESSAGES_KEY,
          {
            conversationId: conversation.id,
          },
        ],
        (old) =>
          produce(old, (draft) => {
            if (msg.id < 0) {
              // regenerating the lastest bot message
              // normally happens when the last bot call failed
              const placeholder = {
                conversationId: conversation.id,
                role: MESSAGE_BOT,
                content: [],
                id: -1,
                isReceiving: true,
              };
              draft?.pop();
              draft?.push(placeholder);
            } else {
              // regenerating an existing bot message
              const target = draft?.find((m) => m.id === msg.id);
              if (target) {
                target.isReceiving = true;
                // set isError to false in case we need to retry from errors with regenerating a message
                target.isError = false;
              }
            }
          })
      );
    },
    [conversation.id, queryClient]
  );

  return (
    <MessageListContextProvider
      messages={messagesWithModelId}
      onRegenerateClick={onRegenerateClick}
      onReceiverReady={onReceiverReady}
    >
      <ScrollArea
        className="flex w-full grow justify-center bg-blue-300"
        viewportRef={viewportRef}
      >
        <div className="relative w-full p-4 md:mx-auto md:w-[640px] md:px-0">
          {isSuccess && <MemoizedMessageList />}
          {/* Spacer */}
          <div className="mt-4 h-8" />
          <MemoizedScrollBottom scrollContainerRef={viewportRef} />
        </div>
      </ScrollArea>
    </MessageListContextProvider>
  );
}
