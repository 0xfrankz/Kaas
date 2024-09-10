import { useSubConversationsLister } from '@/lib/hooks';
import type { Conversation } from '@/lib/types';

export function GroupChat({
  conversation,
}: {
  conversation: Conversation;
}) {
  // Queries
  const subConversationsLister = useSubConversationsLister(conversation.id);
  return <div>GroupChat {conversation.id}</div>;
}
