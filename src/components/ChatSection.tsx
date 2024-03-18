import { useQueryClient } from '@tanstack/react-query';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { emit, listen } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';

import TwoRows from '@/layouts/TwoRows';
import { LIST_MESSAGES_KEY, useCallBotMutation } from '@/lib/hooks';
import log from '@/lib/log';
import type { Conversation, Message } from '@/lib/types';

import ChatMessage from './ChatMessage';
import { ChatMessageList } from './ChatMessageList';
import { ChatPromptInput } from './ChatPromptInput';
import { TitleBar } from './TitleBar';

type Props = {
  conversation: Conversation;
};

export function ChatSection({ conversation }: Props) {
  const [botLoading, setBotLoading] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const callBotMutation = useCallBotMutation();
  const listenerRef = useRef<UnlistenFn>();
  const [activeBotMessage, setActiveBotMessage] = useState('');
  const queryClient = useQueryClient();

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
    callBotMutation.mutate(message, {
      onSuccess: async (botMessage) => {
        await log.info(`Called bot with message: ${message.content}`);
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
        await log.error(`Bot call failed: ${error.message}`);
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
      <TwoRows.Bottom className="overflow-hidden">
        <div className="flex size-full flex-col items-center bg-slate-50">
          <div className="w-full grow overflow-hidden">
            <div className="flex h-full flex-col items-center overflow-y-auto">
              <div className="w-[640px]">
                <ChatMessageList
                  conversationId={conversation.id}
                  onNewUserMessage={onNewUserMessage}
                />
                {botLoading && <ChatMessage.BotLoading />}
              </div>
            </div>
          </div>
          <div className="mt-4 flex w-full justify-center">
            <div className="w-[640px]">
              <ChatPromptInput conversationId={conversation.id} />
            </div>
          </div>
        </div>
      </TwoRows.Bottom>
    </TwoRows>
  );
}
