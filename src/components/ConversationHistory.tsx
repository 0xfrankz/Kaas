import { MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useConversationsContext } from '@/lib/hooks';
import type { ConversationDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

import { ConversationStarter } from './ConversationStarter';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

type Props = {
  activeConversationId: number;
};

type ItemProps = {
  conversation: ConversationDetails;
  active: boolean;
};

function ConversationHistoryItem({ conversation, active }: ItemProps) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        'flex size-full items-center box-border px-3 justify-start rounded-2xl hover:bg-[--yellow-a4] active:bg-[--yellow-a5] shadow-none',
        active
          ? 'bg-[--yellow-a3] text-[--yellow-a11]'
          : 'bg-transparent text-[--gray-a11]'
      )}
    >
      <Link to={`/conversations/${conversation.id}`}>
        <MessageSquare className="size-4" />
        <span className="ml-2 w-40 overflow-hidden text-ellipsis text-left text-sm">
          {conversation.subject}
        </span>
      </Link>
    </Button>
  );
}

export function ConversationHistory({ activeConversationId }: Props) {
  const { conversations } = useConversationsContext();
  const { t } = useTranslation(['page-conversation']);
  return (
    <div className="box-border flex h-full max-h-screen w-72 flex-col gap-6 border-r border-border bg-background px-5 py-6">
      <h3 className="px-2 text-xs font-medium tracking-wide text-gray-400">
        {t('page-conversation:section:conversation-history')}
      </h3>
      <ScrollArea>
        <ul className="mt-3 flex flex-col gap-2">
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
      </ScrollArea>
      <ConversationStarter />
    </div>
  );
}
