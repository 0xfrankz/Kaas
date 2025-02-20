import { useQueryClient } from '@tanstack/react-query';
import { emit } from '@tauri-apps/api/event';
import { animate, motion } from 'framer-motion';
import { produce } from 'immer';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  MESSAGE_BOT,
  MESSAGE_USER,
  SETTING_IS_WIDE_SCREEN,
} from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useBotCaller,
  useGetOptionsQuery,
  useListMessagesQuery,
} from '@/lib/hooks';
import {
  FileUploaderContextProvider,
  MessageListContextProvider,
} from '@/lib/providers';
import { useAppStateStore } from '@/lib/store';
import type { ConversationDetails, Message } from '@/lib/types';
import { cn, getMessageTag } from '@/lib/utils';

import { ChatMessageList } from '../ChatMessageList';
import { ChatStop } from '../ChatStop';
import { ToBottom } from '../ToBottom';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { UserPromptInput } from '../UserPromptInput';

const MemoizedMessageList = memo(ChatMessageList);

export function ChatSectionHasModel({
  conversation,
}: {
  conversation: ConversationDetails;
}) {
  const stickToBottomRef = useRef<boolean>(true);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const showBottomTimerRef = useRef<NodeJS.Timeout | null>(null);
  const goToBottomElRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isWideScreen = useAppStateStore(
    (state) => state.settings[SETTING_IS_WIDE_SCREEN] === 'true'
  );
  const {
    query: { data: options },
  } = useGetOptionsQuery(conversation.id);
  const { t } = useTranslation(['page-conversation']);

  // Queries
  const queryClient = useQueryClient();
  const { data: messages, isSuccess } = useListMessagesQuery(conversation.id);
  const botCaller = useBotCaller();

  // Derived states
  const receiving = useMemo(() => {
    return messages?.some((m) => m.isReceiving) ?? false;
  }, [messages]);
  const isLastMessageFromUser = useMemo(() => {
    return (
      isSuccess &&
      messages?.length > 0 &&
      messages.at(-1)?.role === MESSAGE_USER
    );
  }, [isSuccess, messages]);
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
  const showReasoning = useMemo(
    () => options?.showReasoning ?? false,
    [options]
  );

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

  const onStopClick = useCallback(async () => {
    await emit('stop-bot');
    // update message list data
    queryClient.setQueryData<Message[]>(
      [...LIST_MESSAGES_KEY, { conversationId: conversation.id }],
      (old) =>
        produce(old, (draft) => {
          const target = draft?.find((m) => m.isReceiving);
          if (target) {
            if (target.id < 0) {
              // remove placeholder, which is the last item
              draft?.pop();
            } else {
              target.isReceiving = false;
            }
          }
        })
    );
  }, [conversation.id, queryClient]);

  const onToBottomClick = useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current?.scrollHeight ?? 0,
        behavior: 'smooth',
      });
    }
  }, []);

  const onContinueClick = useCallback(() => {
    // insert placeholder to trigger generation
    // then scroll to bottom
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
    onToBottomClick();
  }, [conversation.id, onToBottomClick, queryClient]);

  // Hooks
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.onscroll = () => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const isAtBottom =
          viewport.scrollTop + viewport.clientHeight === viewport.scrollHeight;

        stickToBottomRef.current = isAtBottom;

        if (isAtBottom) {
          // If at bottom, hide go-to-bottom button
          goToBottomElRef.current?.classList.add('hidden');
        } else if (
          !isAtBottom &&
          goToBottomElRef.current?.classList.contains('hidden') &&
          showBottomTimerRef.current === null
        ) {
          // If not at bottom, and go-to-bottom button is hidden, show it
          showBottomTimerRef.current = setTimeout(() => {
            if (
              !(
                viewport.scrollTop + viewport.clientHeight ===
                viewport.scrollHeight
              )
            ) {
              // show go-to-bottom if still not at bottom when timeout
              if (goToBottomElRef.current) {
                goToBottomElRef.current.classList.remove('hidden');
                animate(
                  goToBottomElRef.current,
                  { opacity: [0, 1], y: [10, 0] },
                  { duration: 0.2 }
                );
              }
            }
            showBottomTimerRef.current = null;
          }, 600);
        }
      };
    }
  }, []);

  useEffect(() => {
    return () => {
      // reset message list when leaving
      queryClient.invalidateQueries({
        queryKey: [
          ...LIST_MESSAGES_KEY,
          {
            conversationId: conversation.id,
          },
        ],
      });
    };
  }, [conversation.id, queryClient]);

  useEffect(() => {
    if (isLastMessageFromUser && !receiving) {
      const storedValue = localStorage.getItem('autoContinue');
      localStorage.removeItem('autoContinue'); // try to remove
      // Auto-continue if the stored conversation ID equal current conversation ID
      // and the last message is from user
      // and we are not currently receiving message from backend
      if (!!storedValue && parseInt(storedValue, 10) === conversation.id) {
        onContinueClick();
      }
    }
  }, [conversation.id, isLastMessageFromUser, onContinueClick, receiving]);

  useEffect(() => {
    // auto scroll to bottom when messages are changed
    // normally happens when page is loaded
    if (
      messages?.length !== 0 &&
      viewportRef.current &&
      stickToBottomRef.current
    ) {
      viewportRef.current?.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    if (receiving && viewportRef.current && stickToBottomRef.current) {
      // auto scroll to bottom when
      // stickToBottom is set and we're receiving new message
      autoScrollRef.current = setInterval(() => {
        if (stickToBottomRef.current) {
          // check sticky marker again
          viewportRef.current?.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: 'instant', // can't use smooth here, it will cause multiple onscroll events and wrongly set the sticky marker
          });
        }
      }, 100);
    }
    if (!receiving) {
      // cancel auto scroll
      clearInterval(autoScrollRef.current ?? undefined);
    }
  }, [receiving]);

  // Render functions
  const renderBottomSection = () => {
    // when receiving, display stop button
    if (receiving)
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.2, type: 'tween' },
          }}
        >
          <div className="mb-9">
            <ChatStop onClick={onStopClick} />
          </div>
        </motion.div>
      );
    // when the last user message is not replied, display continue button
    if (isLastMessageFromUser)
      return (
        <div id="continue-or-input" className="mb-9">
          <Button
            variant="secondary"
            className="rounded-full drop-shadow-lg"
            onClick={onContinueClick}
          >
            {t('generic:action:continue')}
          </Button>
        </div>
      );
    // other wise, display input & go-to-bottom button
    return (
      <>
        <div
          id="to-bottom"
          className="absolute -top-12 mx-auto hidden"
          ref={goToBottomElRef}
        >
          <ToBottom onClick={onToBottomClick} />
        </div>
        <div id="continue-or-input" className="h-fit w-full">
          <FileUploaderContextProvider>
            <UserPromptInput conversation={conversation} />
          </FileUploaderContextProvider>
        </div>
      </>
    );
  };

  return (
    <MessageListContextProvider
      messages={messagesWithModelId}
      onRegenerateClick={onRegenerateClick}
      onReceiverReady={onReceiverReady}
    >
      <ScrollArea
        className="flex w-full grow justify-center"
        viewportRef={viewportRef}
      >
        <div
          className={cn(
            'relative w-full p-4 md:mx-auto md:px-0 transition-[width]',
            isWideScreen ? 'md:w-[800px]' : 'md:w-[640px]'
          )}
        >
          {isSuccess && <MemoizedMessageList showReasoning={showReasoning} />}
          {/* Spacer */}
          <div className="mt-4 h-8" />
        </div>
      </ScrollArea>
      <div
        className={cn(
          'w-full px-4 md:w-[640px] md:px-0 transition-[width]',
          isWideScreen ? 'md:w-[800px]' : 'md:w-[640px]'
        )}
      >
        <div className="relative flex w-full flex-col items-center justify-center">
          {renderBottomSection()}
        </div>
      </div>
    </MessageListContextProvider>
  );
}
