import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import { useMessageListContext } from '@/lib/hooks';

import ChatMessage from './ChatMessage';

export function ChatMessageList({
  showReasoning,
}: {
  showReasoning?: boolean;
}) {
  const { messages } = useMessageListContext();
  const renderMessages = () => {
    const inner = messages ? (
      <ul className="box-border flex flex-col gap-4">
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
                  <ChatMessage.Bot
                    key={message.id}
                    message={message}
                    showReasoning={showReasoning}
                  />
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
