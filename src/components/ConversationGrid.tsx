import type { Conversation } from '@/lib/types';

function ConversationGridItem({
  conversation,
}: {
  conversation: Conversation;
}) {
  return <div>{conversation.subject}</div>;
}
export function ConversationGrid({
  conversations,
}: {
  conversations: Conversation[];
}) {
  return (
    <div>
      {conversations.map((conversation) => {
        return (
          <ConversationGridItem
            conversation={conversation}
            key={conversation.id}
          />
        );
      })}
    </div>
  );
}
