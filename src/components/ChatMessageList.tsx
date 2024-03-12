import { useListMessages } from '@/lib/hooks';
import type { Message } from '@/lib/types';

type Props = {
  conversationId: number;
};

type ItemProps = {
  message: Message;
};

function ChatMessageListItem({ message }: ItemProps) {
  return (
    <span>
      {message.id}: {message.content}
    </span>
  );
}

export function ChatMessageList({ conversationId }: Props) {
  // Queries
  const { data: messages, isSuccess } = useListMessages(conversationId);

  // Render functions
  const renderMessages = () => {
    if (messages) {
      return (
        <ul>
          {messages.map((message) => (
            <ChatMessageListItem message={message} />
          ))}
        </ul>
      );
    }
    // TODO: handle the corner case of no message in a conversation
    // maybe when user manually deletes all messages?
    return <div>No messages</div>;
  };

  return isSuccess ? renderMessages() : null;
}
