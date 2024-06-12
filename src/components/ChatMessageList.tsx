import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import { useMessageListContext } from '@/lib/hooks';
import type { Message } from '@/lib/types';

import ChatMessage from './ChatMessage';

export function ChatMessageList() {
  const { messages } = useMessageListContext();
  // Render functions
  const renderBotMessage = (msg: Message) => {
    if (msg.receiving) {
      return <ChatMessage.BotReceiver message={msg} />;
    }
    return <ChatMessage.Bot key={msg.id} message={msg} />;
  };
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
              return <li key={message.id}>{renderBotMessage(message)}</li>;
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
