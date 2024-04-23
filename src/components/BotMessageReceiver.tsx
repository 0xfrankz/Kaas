import type { UnlistenFn } from '@tauri-apps/api/event';
import { emit, listen } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  STREAM_DONE,
  STREAM_ERROR,
  STREAM_START,
  STREAM_STOPPED,
} from '@/lib/constants';

import ChatMessage from './ChatMessage';

type Props = {
  onReady: () => void;
  onReceivingChange: (receiving: boolean) => void;
  onMessageReceived: (message: string) => void;
};

export function BotMessageReceiver({
  onReady,
  onReceivingChange,
  onMessageReceived,
}: Props) {
  const [receiving, setReceiving] = useState(false);
  const acceptingRef = useRef<boolean>(false);
  const [activeBotMessage, setActiveBotMessage] = useState('');
  const listenerRef = useRef<UnlistenFn>();
  const mountedRef = useRef(false);

  const startStreaming = () => {
    setReceiving(true);
    onReceivingChange(true);
    acceptingRef.current = true;
  };

  const endStreaming = () => {
    setReceiving(false);
    onReceivingChange(false);
    acceptingRef.current = false;
  };

  const unbindListener = () => {
    if (listenerRef.current) {
      listenerRef.current();
      listenerRef.current = undefined;
    }
  };

  const bindListener = async () => {
    listenerRef.current = await listen<string>('bot-reply', (event) => {
      const nextMsg = event.payload;
      console.log(`Listener received: ${nextMsg}`);
      switch (true) {
        case nextMsg === STREAM_START:
          startStreaming();
          break;
        case nextMsg === STREAM_DONE:
          endStreaming();
          break;
        case nextMsg === STREAM_STOPPED:
          endStreaming();
          break;
        case nextMsg.startsWith(STREAM_ERROR):
          toast.error(`Bot Error: ${nextMsg.split(STREAM_ERROR).at(-1)}`);
          endStreaming();
          break;
        default:
          if (acceptingRef.current) {
            setActiveBotMessage((state) => {
              return `${state}${nextMsg}`;
            });
          }
          break;
      }
    });
  };

  const mount = async () => {
    // stop bot when entering the page
    // in case it was left running before
    await emit('stop-bot');
    await bindListener();
    onReady();
  };

  const unmount = () => {
    unbindListener();
    // stop bot when leaving the page
    emit('stop-bot');
  };

  useEffect(() => {
    if (!mountedRef.current) {
      // when not mounted
      mount();
      mountedRef.current = true; // avoid binding listener twice in strict mode
    }
    return unmount;
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
