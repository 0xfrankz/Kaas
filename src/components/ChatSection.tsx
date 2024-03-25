import { useQueryClient } from '@tanstack/react-query';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { emit, listen } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import {
  LIST_MESSAGES_KEY,
  useCallBothWithConversationMutation,
} from '@/lib/hooks';
import log from '@/lib/log';
import type { Conversation, Message } from '@/lib/types';

import ChatMessage from './ChatMessage';
import { ChatMessageList } from './ChatMessageList';
import { ChatPromptInput } from './ChatPromptInput';
import { ScrollBottom } from './ScrollBottom';
import { TitleBar } from './TitleBar';
import { useToast } from './ui/use-toast';

type Props = {
  conversation: Conversation;
};

export function ChatSection({ conversation }: Props) {
  const [botLoading, setBotLoading] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const callBotMutation = useCallBothWithConversationMutation();
  const listenerRef = useRef<UnlistenFn>();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeBotMessage, setActiveBotMessage] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const bindListener = async () => {
    listenerRef.current = await listen<string>('bot-reply', (event) => {
      setActiveBotMessage((state) => {
        return `${state}${event.payload}`;
      });
    });
    await log.info('Listener is bound');
  };

  const unbindListener = async () => {
    if (listenerRef.current) {
      listenerRef.current();
      listenerRef.current = undefined;
      await log.info('Listener is unbound');
    }
  };

  // Callbacks
  const onNewUserMessage = async (message: Message) => {
    await log.info(`New user message received: ${message.content}`);
    setBotLoading(true);
    // call bot
    callBotMutation.mutate(conversation.id, {
      onSuccess: async (botMessage) => {
        callBotMutation.reset();
        // Update cache
        queryClient.setQueryData<Message[]>(
          [...LIST_MESSAGES_KEY, { conversationId: conversation.id }],
          (messages) => (messages ? [...messages, botMessage] : [botMessage])
        );
        // Stop loading
        setBotLoading(false);
      },
      onError: async (error) => {
        const errMsg = `Bot call failed: ${error.message}`;
        await log.error(errMsg);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errMsg,
        });
      },
    });
  };

  const onUnmount = async () => {
    await unbindListener();
    await emit('stop-bot');
  };

  // Effects
  useEffect(() => {
    if (receiving) {
      // Bind listener to receive server events
      bindListener();
    } else {
      // When all parts are received, unbind listener
      unbindListener();
    }
  }, [receiving]);

  useEffect(() => {
    return () => {
      onUnmount();
    };
  }, [conversation]);

  return (
    <TwoRows className="max-h-screen">
      <TwoRows.Top>
        <TitleBar title={conversation.subject} />
      </TwoRows.Top>
      <TwoRows.Bottom className="flex size-full flex-col items-center overflow-hidden bg-slate-50">
        <ScrollArea className="w-full grow" viewportRef={viewportRef}>
          <div className="mx-auto w-[640px] pb-4">
            <ChatMessageList
              conversationId={conversation.id}
              onNewUserMessage={onNewUserMessage}
            />
            {botLoading && <ChatMessage.BotLoading />}
          </div>
          <ScrollBottom scrollContainerRef={viewportRef} />
        </ScrollArea>
        <div className="mt-4 w-full">
          <div className="mx-auto w-[640px]">
            <ChatPromptInput conversationId={conversation.id} />
          </div>
        </div>
      </TwoRows.Bottom>
    </TwoRows>
  );
}
