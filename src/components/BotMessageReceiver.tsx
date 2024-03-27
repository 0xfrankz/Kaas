import type { UnlistenFn } from '@tauri-apps/api/event';
import { emit, listen } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';

import { STREAM_DONE, STREAM_ERROR, STREAM_START } from '@/lib/constants';
import log from '@/lib/log';

import ChatMessage from './ChatMessage';
import { useToast } from './ui/use-toast';

type Props = {
  onMessageReceived: (message: string) => void;
};

export function BotMessageReceiver({ onMessageReceived }: Props) {
  const [receiving, setReceiving] = useState(false);
  const [activeBotMessage, setActiveBotMessage] = useState('');
  const listenerRef = useRef<UnlistenFn>();
  const { toast } = useToast();

  const bindListener = async () => {
    listenerRef.current = await listen<string>('bot-reply', (event) => {
      const nextMsg = event.payload;
      switch (true) {
        case nextMsg === STREAM_START:
          setReceiving(true);
          break;
        case nextMsg === STREAM_DONE:
          setReceiving(false);
          break;
        case nextMsg.startsWith(STREAM_ERROR):
          toast({
            variant: 'destructive',
            title: 'Bot Error',
            description: nextMsg.split(STREAM_ERROR).at(-1),
          });
          setReceiving(false);
          break;
        default:
          setActiveBotMessage((state) => {
            return `${state}${nextMsg}`;
          });
          break;
      }
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

  useEffect(() => {
    bindListener();
    return () => {
      unbindListener();
      emit('stop-bot');
    };
  }, []);

  useEffect(() => {
    if (!receiving && activeBotMessage.length > 0) {
      onMessageReceived(activeBotMessage);
      setActiveBotMessage('');
    }
  }, [activeBotMessage, receiving]);

  const render = () => {
    return activeBotMessage.length > 0 ? (
      <ChatMessage.BotReceiving message={activeBotMessage} />
    ) : (
      <ChatMessage.BotLoading />
    );
  };

  return receiving ? render() : null;
}
