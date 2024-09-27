import { useQueryClient } from '@tanstack/react-query';
import { animate } from 'framer-motion';
import { produce } from 'immer';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import { MESSAGE_BOT } from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useBotCaller,
  useListMessagesQuery,
} from '@/lib/hooks';
import { MessageListContextProvider } from '@/lib/providers';
import type { Conversation, Message } from '@/lib/types';
import { cn, getMessageTag } from '@/lib/utils';

import { ChatMessageList } from '../ChatMessageList';
import { ScrollBottom } from '../ScrollBottom';
import { ToBottom } from '../ToBottom';
import { ScrollArea } from '../ui/scroll-area';

const MemoizedMessageList = memo(ChatMessageList);
const MemoizedScrollBottom = memo(ScrollBottom);

type Props = {
  conversation: Conversation;
  wide?: boolean;
};

export function Chat({ conversation, wide = false }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef<boolean>(false);
  const showBottomTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const onToBottomClick = useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current?.scrollHeight ?? 0,
        behavior: 'smooth',
      });
    }
  }, []);

  const checkBottom = useCallback(() => {
    const el = document.getElementById('to-bottom');
    if (
      (viewportRef.current?.scrollTop ?? 0) +
        (viewportRef.current?.clientHeight ?? 0) ===
      viewportRef.current?.scrollHeight
    ) {
      // at bottom, hide go-to-bottom button
      el?.classList.add('hidden');
      atBottomRef.current = true;
    } else {
      // not at bottom and button not shown, show go-to-bottom button
      atBottomRef.current = false;
      if (
        el?.classList.contains('hidden') &&
        showBottomTimerRef.current === null
      ) {
        showBottomTimerRef.current = setTimeout(() => {
          if (!atBottomRef.current) {
            // show go-to-bottom if still not at bottom when timeout
            if (el) {
              el.classList.remove('hidden');
              animate(el, { opacity: [0, 1], y: [30, 0] }, { duration: 0.2 });
            }
          }
          showBottomTimerRef.current = null;
        }, 600);
      }
    }
  }, []);

  // Hooks
  useEffect(() => {
    // check position upon initialization
    checkBottom();
    if (viewportRef.current) {
      viewportRef.current.onscroll = () => {
        checkBottom();
      };
    }
  }, [checkBottom]);

  return (
    <MessageListContextProvider
      messages={messagesWithModelId}
      onRegenerateClick={onRegenerateClick}
      onReceiverReady={onReceiverReady}
    >
      <ScrollArea
        className="flex w-full grow justify-center pb-2"
        viewportRef={viewportRef}
      >
        <div
          className={cn(
            'relative w-full p-4 md:mx-auto md:px-0 transition-[width]',
            wide ? 'md:w-[800px]' : 'md:w-[640px]'
          )}
        >
          {isSuccess && <MemoizedMessageList />}
          {/* Spacer */}
          <div className="h-12" />
          <MemoizedScrollBottom scrollContainerRef={viewportRef} />
        </div>
        <div
          id="to-bottom"
          className="absolute bottom-4 flex w-full justify-center"
        >
          <ToBottom onClick={onToBottomClick} />
        </div>
      </ScrollArea>
    </MessageListContextProvider>
  );
}
