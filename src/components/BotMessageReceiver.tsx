import { useEffect } from 'react';

import { useBotCaller } from '@/lib/hooks';

import ChatMessage from './ChatMessage';

type Props = {
  onReady: () => void;
  onReceivingChange: (receiving: boolean) => void;
  onMessageReceived: (message: string) => void;
  onError: (errMsg: string) => void;
};

export function BotMessageReceiver({
  onReady,
  onReceivingChange,
  onMessageReceived,
  onError,
}: Props) {
  const { ready, receiving, message, error } = useBotCaller();

  useEffect(() => {
    onReceivingChange(receiving);
  }, [receiving]);

  useEffect(() => {
    if (ready) onReady();
  }, [ready]);

  useEffect(() => {
    if (error) onError(error);
  }, [error]);

  useEffect(() => {
    if (!receiving && message.length > 0) {
      onMessageReceived(message);
    }
  }, [message, receiving]);

  const render = () => {
    return message.length > 0 ? (
      <ChatMessage.BotReceiving message={message} />
    ) : (
      <ChatMessage.BotLoading />
    );
  };

  return receiving ? render() : null;
}
