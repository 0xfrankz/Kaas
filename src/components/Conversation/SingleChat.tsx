import { useQueryClient } from '@tanstack/react-query';
import { emit } from '@tauri-apps/api/event';
import { motion } from 'framer-motion';
import { produce } from 'immer';
import { ListRestart } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  MESSAGE_BOT,
  MESSAGE_USER,
  SETTING_IS_WIDE_SCREEN,
} from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useListMessagesQuery,
  useMessagesHardDeleter,
} from '@/lib/hooks';
import { FileUploaderContextProvider } from '@/lib/providers';
import { useAppStateStore, useConfirmationStateStore } from '@/lib/store';
import type { Conversation, Message } from '@/lib/types';
import { cn } from '@/lib/utils';

import { ChatStop } from '../ChatStop';
import { Button } from '../ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';
import { UserPromptInput } from '../UserPromptInput';
import { Chat } from './Chat';

export function SingleChat({ conversation }: { conversation: Conversation }) {
  const isWideScreen = useAppStateStore(
    (state) => state.settings[SETTING_IS_WIDE_SCREEN] === 'true'
  );
  const { t } = useTranslation(['page-conversation']);
  const { open } = useConfirmationStateStore();

  // Queries
  const queryClient = useQueryClient();
  const { data: messages, isSuccess } = useListMessagesQuery(conversation.id);
  const deleter = useMessagesHardDeleter({
    onSettled: (_, error) => {
      if (error) {
        toast.error(
          t('page-conversation:message:restart-conversation-error', {
            errorMsg: error.message,
          })
        );
      } else {
        queryClient.setQueryData(
          [...LIST_MESSAGES_KEY, { conversationId: conversation.id }],
          () => {
            return [];
          }
        );
        toast.success(
          t('page-conversation:message:restart-conversation-success')
        );
      }
    },
  });

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

  // Callbacks
  const onRestartClick = () => {
    open({
      title: t('generic:message:are-you-sure'),
      message: t('page-conversation:message:restart-conversation-warning'),
      onConfirm: () => {
        deleter(conversation.id);
      },
    });
  };

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
    // onToBottomClick();
  }, [conversation.id, queryClient]);

  // Hooks
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
        {/* <div id="to-bottom" className="absolute -top-12 mx-auto hidden">
          <ToBottom onClick={onToBottomClick} />
        </div> */}
        <div id="continue-or-input" className="h-fit w-full">
          <FileUploaderContextProvider>
            <UserPromptInput conversation={conversation} />
          </FileUploaderContextProvider>
        </div>
      </>
    );
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="flex size-full flex-col items-center justify-between overflow-hidden">
          <Chat conversation={conversation} wide={isWideScreen} />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            className="cursor-pointer gap-2"
            onClick={onRestartClick}
          >
            <ListRestart className="size-4" /> {t('generic:action:restart')}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
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
    </>
  );
}
