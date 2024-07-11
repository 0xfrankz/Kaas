import { useMemo } from 'react';

import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import { useMessageListContext } from '@/lib/hooks';

import ChatMessage from './ChatMessage';

export function ChatMessageList() {
  const { messages } = useMessageListContext();
  const messagesWithUsage = useMemo(() => {
    const mwu = [];
    for (let i = 0; i < messages.length; i += 1) {
      const msg = messages[i];
      if (msg.role === MESSAGE_USER) {
        const nextMsg = messages[i + 1];
        if (nextMsg && nextMsg.role === MESSAGE_BOT) {
          msg.promptToken = nextMsg.promptToken; // Bot reply's prompt token usage is the corresponding user message's token usage
        }
      }
      mwu.push(msg);
    }
    return mwu;
  }, [messages]);
  const renderMessages = () => {
    const inner = messagesWithUsage ? (
      <ul className="box-border pt-6">
        {messagesWithUsage.map((message) => {
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

  return renderMessages();
}
