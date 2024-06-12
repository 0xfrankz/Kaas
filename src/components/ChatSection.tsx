import { useQueryClient } from '@tanstack/react-query';
import { animate, motion } from 'framer-motion';
import { produce } from 'immer';
import { Package } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  useMessageCreator,
  useMessageUpdater,
  useSubjectUpdater,
} from '@/lib/hooks';
import { MessageListContextProvider } from '@/lib/providers';
import { useAppStateStore } from '@/lib/store';
import type {
  ConversationDetails,
  Message,
  Model,
  StatefulDialogHandler,
} from '@/lib/types';
import { cn, getMessageTag } from '@/lib/utils';

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
  const [atBottom, setAtBottom] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<StatefulDialogHandler<string>>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const model = useAppStateStore((state) =>
    state.models.find((m) => m.id === conversation.modelId)
  );
  const { t } = useTranslation(['page-conversation']);

  // Queries
  const queryClient = useQueryClient();
  const { data: messages, isSuccess } = useListMessagesQuery(conversation.id);
  // const callBotMutation = useCallBot();
  const botCaller = useBotCaller();
  const creator = useMessageCreator();
  const updater = useMessageUpdater();
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
    return messages?.some((m) => m.receiving) ?? false;
  }, [messages]);

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
  const onNewUserMessage = useCallback(
    (_message: Message) => {
      const placeholder = {
        conversationId: conversation.id,
        role: MESSAGE_BOT,
        content: { items: [] },
        id: -1,
        receiving: true,
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
    },
    [conversation.id, queryClient]
  );

  // Callback when bot's reply is fully received
  // create or update message here
  const onMessageReceived = useCallback(
    (message: Message) => {
      if (message.id < 0) {
        // new message
        creator({
          conversationId: conversation.id,
          role: message.role,
          content: message.content,
        });
      } else {
        updater(message);
      }
    },
    [conversation.id, creator, updater]
  );

  const onReceiverReady = useCallback(() => {
    const placeholder = messages?.find((m) => m.receiving);
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
      console.log('onRegenerateClick:', msg);
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
                content: { items: [] },
                id: -1,
                receiving: true,
              };
              draft?.pop();
              draft?.push(placeholder);
            } else {
              const target = draft?.find((m) => m.id === msg.id);
              if (target) target.receiving = true;
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

  useEffect(() => {
    if (isSuccess && messages?.length > 0) {
      const lastMsg = messages.at(-1);
      if (lastMsg?.role === MESSAGE_USER) {
        onNewUserMessage(lastMsg);
      }
    }
  }, [isSuccess, messages, onNewUserMessage]);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.onscroll = () => {
        setAtBottom(
          (viewportRef.current?.scrollTop ?? 0) +
            (viewportRef.current?.clientHeight ?? 0) ===
            viewportRef.current?.scrollHeight
        );
      };
      if (
        (viewportRef.current?.clientHeight ?? 0) ===
        viewportRef.current?.scrollHeight
      ) {
        // clientHeight is less than screen height
        // no scroll bar shown and we're at the bottom
        setAtBottom(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!receiving) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (atBottom) {
        document.getElementById('to-bottom')?.classList.add('hidden');
        const el = document.getElementById('prompt-input');
        if (el) {
          el.classList.remove('hidden');
          animate(el, { opacity: [0, 1], y: [30, 0] }, { duration: 0.2 });
        }
      } else {
        if (timerRef.current === null) {
          timerRef.current = setTimeout(() => {
            const el = document.getElementById('to-bottom');
            if (el) {
              el.classList.remove('hidden');
              animate(el, { opacity: [0, 1], y: [30, 0] }, { duration: 0.2 });
            }
          }, 600);
        }
        document.getElementById('prompt-input')?.classList.add('hidden');
      }
    }
  }, [atBottom, receiving]);

  useEffect(() => {
    if (!model && dialogRef.current && !dialogRef.current.isOpen()) {
      // when model is not set, open picker dialog by default
      dialogRef.current.open(conversation.subject);
    }
  }, [model, conversation.subject]);

  const renderBottomSection = () => {
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
          <ChatStop />
        </motion.div>
      );
    return (
      <>
        <div id="to-bottom" className="hidden">
          <ToBottom onClick={onToBottomClick} />
        </div>
        <div id="prompt-input" className="size-full">
          <ChatPromptInput conversationId={conversation.id} />
        </div>
      </>
    );
  };

  const render = () => {
    return (
      <ScrollArea className="w-full grow" viewportRef={viewportRef}>
        <div className="relative mx-auto w-[640px]">
          {isSuccess && (
            <MessageListContextProvider
              messages={messagesWithModelId}
              onRegenerateClick={onRegenerateClick}
              onMessageReceived={onMessageReceived}
              onReceiverReady={onReceiverReady}
            >
              <MemoizedMessageList />
            </MessageListContextProvider>
          )}
          {/* Spacer */}
          <div className="mt-4 h-[104px]" />
          <MemoizedScrollBottom scrollContainerRef={viewportRef} />
          <div
            className={cn(
              'fixed bottom-0 mt-4 flex min-h-[104px] w-[640px]',
              atBottom ? ' bg-background' : 'bg-transparent'
            )}
          >
            <div className="flex w-full flex-col items-center justify-center">
              {renderBottomSection()}
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  };

  const renderNoModel = () => {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-4">
        <h2 className="text-3xl font-semibold tracking-tight">
          {t('page-conversation:message:no-model')}
        </h2>
        <Button onClick={onChooseClick}>
          <Package className="size-4 text-foreground" />
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
      <TwoRows.Bottom className="flex size-full flex-col items-center overflow-hidden bg-background">
        {model ? render() : renderNoModel()}
      </TwoRows.Bottom>
    </TwoRows>
  );
}
