import { useQueryClient } from '@tanstack/react-query';
import { emit } from '@tauri-apps/api/event';
import { animate, motion } from 'framer-motion';
import { produce } from 'immer';
import { Package } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  OPTIONS_CONVERSATION_KEY,
  useBotCaller,
  useConversationModelUpdater,
  useListMessagesQuery,
  useSubjectUpdater,
} from '@/lib/hooks';
import {
  FileUploaderContextProvider,
  MessageListContextProvider,
} from '@/lib/providers';
import { useAppStateStore } from '@/lib/store';
import type {
  ConversationDetails,
  Message,
  Model,
  StatefulDialogHandler,
} from '@/lib/types';
import { getMessageTag } from '@/lib/utils';

import { ChatMessageList } from './ChatMessageList';
import { ChatPromptInput } from './ChatPromptInput';
import { ChatStop } from './ChatStop';
import { ConversationTitleBar } from './ConversationTitleBar';
import { ModelPickerDialog } from './ModelPickerDialog';
import { ScrollBottom } from './ScrollBottom';
import { ToBottom } from './ToBottom';
import { Button } from './ui/button';

const MemoizedMessageList = memo(ChatMessageList);
const MemoizedTitleBar = memo(ConversationTitleBar);
const MemoizedScrollBottom = memo(ScrollBottom);

type Props = {
  conversation: ConversationDetails;
};

export function ChatSection({ conversation }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<StatefulDialogHandler<string>>(null);
  const showBottomTimerRef = useRef<NodeJS.Timeout | null>(null);
  const atBottomRef = useRef<boolean>(false);
  const showContinueTimerRef = useRef<NodeJS.Timeout | null>(null);
  const model = useAppStateStore((state) =>
    state.models.find((m) => m.id === conversation.modelId)
  );
  const { t } = useTranslation(['page-conversation']);

  // Queries
  const queryClient = useQueryClient();
  const { data: messages, isSuccess } = useListMessagesQuery(conversation.id);
  const botCaller = useBotCaller();
  const subjectUpdater = useSubjectUpdater();
  const modelUpdater = useConversationModelUpdater({
    onSettled(c) {
      // invalidate option's cache
      queryClient.invalidateQueries({
        queryKey: [...OPTIONS_CONVERSATION_KEY, { conversationId: c?.id }],
      });
    },
  });

  // Derived states
  const receiving = useMemo(() => {
    return messages?.some((m) => m.isReceiving) ?? false;
  }, [messages]);
  const isLastMessageFromUser =
    isSuccess && messages?.length > 0 && messages.at(-1)?.role === MESSAGE_USER;
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
              const target = draft?.find((m) => m.id === msg.id);
              if (target) target.isReceiving = true;
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

  const onTitleChange = useCallback(
    (newTitle: string) => {
      subjectUpdater({ conversationId: conversation.id, subject: newTitle });
    },
    [conversation.id, subjectUpdater]
  );

  const onChooseClick = useCallback(() => {
    dialogRef.current?.open(conversation.subject);
  }, [conversation.subject]);

  const onChooseSubmit = useCallback(
    (selectedModel: Model) => {
      modelUpdater({
        conversationId: conversation.id,
        modelId: selectedModel.id,
      });
    },
    [conversation.id, modelUpdater]
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

  const checkBottom = useCallback(() => {
    const el = document.getElementById('to-bottom');
    if (
      (viewportRef.current?.scrollTop ?? 0) +
        (viewportRef.current?.clientHeight ?? 0) ===
      viewportRef.current?.scrollHeight
    ) {
      // at bottom, hide go-to-bottom button
      el?.classList.add('hidden');
    } else {
      // not at bottom and button not shown, show go-to-bottom button
      atBottomRef.current = false;
      if (
        el?.classList.contains('hidden') &&
        showBottomTimerRef.current === null
      ) {
        showBottomTimerRef.current = setTimeout(() => {
          if (!atBottomRef.current) {
            // scroll if still not at bottom when timeout
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

  useEffect(() => {
    // check position upon initialization
    checkBottom();
    if (viewportRef.current) {
      viewportRef.current.onscroll = () => {
        checkBottom();
      };
    }
  }, [checkBottom]);

  useEffect(() => {
    if (!model && dialogRef.current && !dialogRef.current.isOpen()) {
      // when model is not set, open picker dialog by default
      dialogRef.current.open(conversation.subject);
    }
  }, [model, conversation.subject]);

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
        <div id="to-bottom" className="absolute -top-12 mx-auto">
          <ToBottom onClick={onToBottomClick} />
        </div>
        <div id="continue-or-input" className="h-fit w-full">
          <FileUploaderContextProvider>
            <ChatPromptInput conversationId={conversation.id} />
          </FileUploaderContextProvider>
        </div>
      </>
    );
  };

  const render = () => {
    return (
      <>
        <ScrollArea className="w-full" viewportRef={viewportRef}>
          <div className="relative mx-auto w-[640px]">
            {isSuccess && (
              <MessageListContextProvider
                messages={messagesWithModelId}
                onRegenerateClick={onRegenerateClick}
                onReceiverReady={onReceiverReady}
              >
                <MemoizedMessageList />
              </MessageListContextProvider>
            )}
            {/* Spacer */}
            <div className="mt-4 h-8" />
            <MemoizedScrollBottom scrollContainerRef={viewportRef} />
          </div>
        </ScrollArea>
        <div className="w-[640px] bg-background">
          <div className="relative flex w-full flex-col items-center justify-center">
            {renderBottomSection()}
          </div>
        </div>
      </>
    );
  };

  const renderNoModel = () => {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-4">
        <h2 className="text-3xl font-semibold tracking-tight">
          {t('page-conversation:message:no-model')}
        </h2>
        <Button onClick={onChooseClick}>
          <Package className="size-4" />
          <span className="ml-2">{t('generic:action:choose-a-model')}</span>
        </Button>
        <ModelPickerDialog ref={dialogRef} onSubmit={onChooseSubmit} />
      </div>
    );
  };

  return (
    <TwoRows className="max-h-screen">
      <TwoRows.Top>
        <MemoizedTitleBar
          conversation={conversation}
          model={model}
          onEditDone={onTitleChange}
        />
      </TwoRows.Top>
      <TwoRows.Bottom className="flex size-full flex-col items-center justify-between overflow-hidden bg-background">
        {model ? render() : renderNoModel()}
      </TwoRows.Bottom>
    </TwoRows>
  );
}
