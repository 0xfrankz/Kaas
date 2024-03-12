import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import { useListMessages } from '@/lib/hooks';

import ChatMessage from './ChatMessage';

type Props = {
  conversationId: number;
};

export function ChatMessageList({ conversationId }: Props) {
  // Queries
  const { data: messages, isSuccess } = useListMessages(conversationId);

  // Render functions
  const renderMessages = () => {
    const inner = messages ? (
      <ul className="box-border pt-6">
        {messages.map((message) => {
          switch (message.role) {
            case MESSAGE_USER:
              return (
                <li>
                  <ChatMessage.User key={message.id} message={message} />
                </li>
              );
            case MESSAGE_BOT:
              return (
                <li>
                  <ChatMessage.Bot key={message.id} message={message} />
                </li>
              );
            default:
              return (
                <li>
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

    return <div className="h-full w-auto">{inner}</div>;
  };

  return isSuccess ? renderMessages() : null;
}
