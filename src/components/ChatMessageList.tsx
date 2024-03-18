import { useEffect } from 'react';

import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import { useListMessagesQuery } from '@/lib/hooks';
import type { Message } from '@/lib/types';

import ChatMessage from './ChatMessage';

type Props = {
  conversationId: number;
  onNewUserMessage: (message: Message) => void;
};

export function ChatMessageList({ conversationId, onNewUserMessage }: Props) {
  // Queries
  const { data: messages, isSuccess } = useListMessagesQuery(conversationId);

  useEffect(() => {
    if (isSuccess && messages?.length > 0) {
      const lastMsg = messages.at(-1);
      if (lastMsg?.role === MESSAGE_USER) {
        onNewUserMessage(lastMsg);
      }
    }
  }, [isSuccess, messages]);

  // Render functions
  const renderMessages = () => {
    const inner = messages ? (
      <ul className="box-border pt-6">
        {messages.map((message) => {
          switch (message.role) {
            case MESSAGE_USER:
              return (
                <li key={message.id}>
                  <ChatMessage.User key={message.id} message={message} />
                </li>
              );
            case MESSAGE_BOT:
              return (
                <li key={message.id}>
                  <ChatMessage.Bot key={message.id} message={message} />
                </li>
              );
            default:
              return (
                <li key={message.id}>
                  <ChatMessage.System key={message.id} message={message} />
                </li>
              );
          }
        })}
      </ul>
    ) : (
      // TODO: handle the corner case of no message in a conversation
      // maybe when user manually deletes all messages?
      <h2>No messages</h2>
    );

    return <div className="w-auto">{inner}</div>;
  };

  return isSuccess ? renderMessages() : null;
}
