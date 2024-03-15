import type { UnlistenFn } from '@tauri-apps/api/event';
import { emit, listen } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';

import TwoRows from '@/layouts/TwoRows';
import { useCallBotMutation } from '@/lib/hooks';
import log from '@/lib/log';
import type { Conversation, Message } from '@/lib/types';

import { ChatMessageList } from './ChatMessageList';
import { ChatPromptInput } from './ChatPromptInput';
import { TitleBar } from './TitleBar';

type Props = {
  conversation: Conversation;
};

export function ChatSection({ conversation }: Props) {
  const [receiving, setReceiving] = useState(false);
  const callBotMutation = useCallBotMutation();
  const listenerRef = useRef<UnlistenFn>();
  const [activeBotMessage, setActiveBotMessage] = useState('');

  console.log(`ChatSection: receiving = ${receiving}`);

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
    // call bot
    callBotMutation.mutate(message, {
      onSuccess: async () => {
        await log.info(`Called bot with message: ${message.content}`);
        callBotMutation.reset();
        // Turn on receiving mark
        setReceiving(true);
        setActiveBotMessage('');
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
    <TwoRows>
      <TwoRows.Top>
        <TitleBar title={conversation.subject} />
      </TwoRows.Top>
      <TwoRows.Bottom>
        <div className="flex size-full flex-col items-center bg-slate-50">
          <div className="w-[640px] grow">
            <ChatMessageList
              conversationId={conversation.id}
              onNewUserMessage={onNewUserMessage}
            />
          </div>
          <span>{activeBotMessage}</span>
          <div className="w-[640px]">
            <ChatPromptInput conversationId={conversation.id} />
          </div>
        </div>
      </TwoRows.Bottom>
    </TwoRows>
  );
}
