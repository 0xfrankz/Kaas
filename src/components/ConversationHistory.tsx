import { ChatBubbleIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';

import { useConversationsContext } from '@/lib/hooks';
import type { Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';

type Props = {
  activeConversationId: number;
};

type ItemProps = {
  conversation: Conversation;
  active: boolean;
};

function ConversationHistoryItem({ conversation, active }: ItemProps) {
  return (
    <Button
      asChild
      className={cn(
        'flex size-full items-center box-border px-3 justify-start rounded-2xl',
        active
          ? 'bg-[#F9FFB8] text-slate-900 hover:bg-[#F9FFB8] shadow-sm'
          : 'bg-transparent text-slate-500 hover:bg-gray-50'
      )}
    >
      <Link to={`/conversations/${conversation.id}`}>
        <ChatBubbleIcon className="size-4" />
        <span className="ml-2 w-40 overflow-hidden text-ellipsis text-left text-sm">
          {conversation.subject}
        </span>
      </Link>
    </Button>
  );
}

export function ConversationHistory({ activeConversationId }: Props) {
  const { conversations } = useConversationsContext();
  return (
    <div className="box-border h-full w-72 border-r border-gray-200 px-5 py-6">
      <h3 className="px-2 text-xs font-medium tracking-wide text-gray-400">
        Conversation history
      </h3>
      <ul className="mt-3">
        {conversations.map((c) => {
          return (
            <li key={c.id} className="h-12">
              <ConversationHistoryItem
                conversation={c}
                active={c.id === activeConversationId}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
