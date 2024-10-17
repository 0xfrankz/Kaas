import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { PROVIDER_UNKNOWN } from '@/lib/constants';
import { useConversationsContext } from '@/lib/hooks';
import type { ConversationDetails } from '@/lib/types';
import { cn } from '@/lib/utils';

import { ProviderTag } from './ProviderTag';
import { Button } from './ui/button';

type Props = {
  activeConversationId: number;
  numToShow?: number;
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
        'flex items-center box-border justify-start rounded-2xl hover:bg-[--yellow-a4] active:bg-[--yellow-a5] shadow-none',
        active
          ? 'bg-[--yellow-a3] text-[--yellow-a11]'
          : 'bg-transparent text-[--gray-a11]'
      )}
    >
      <Link to={`/conversations/${conversation.id}`}>
        <ProviderTag
          provider={conversation.modelProvider ?? PROVIDER_UNKNOWN}
          showText={false}
        />
        <span className="ml-2 w-40 overflow-hidden text-ellipsis text-left text-sm">
          {conversation.subject}
        </span>
      </Link>
    </Button>
  );
}

export function ConversationHistory({
  activeConversationId,
  numToShow = 5,
}: Props) {
  const { conversations } = useConversationsContext();
  const { t } = useTranslation(['page-conversation', 'page-conversations']);
  return (
    <div className="box-border flex h-fit w-full flex-col gap-2">
      {conversations.length > 0 ? (
        <>
          <h3 className="w-full overflow-hidden whitespace-nowrap text-xs font-medium tracking-wide text-gray-400">
            {t('page-conversation:section:recent')}
          </h3>
          <ul className="flex flex-col gap-2">
            {conversations.slice(0, numToShow).map((c) => {
              return (
                <li key={c.id}>
                  <ConversationHistoryItem
                    conversation={c}
                    active={c.id === activeConversationId}
                  />
                </li>
              );
            })}
            {conversations.length - numToShow > 0 ? (
              <li>
                <Button
                  asChild
                  variant="link"
                  className={cn(
                    'flex items-center box-border justify-start',
                    'bg-transparent text-[--gray-a11]'
                  )}
                >
                  <Link to="/conversations/">
                    <span className="text-left text-xs">
                      {t('generic:message:n-more-conversations', {
                        n: conversations.length - numToShow,
                      })}
                    </span>
                  </Link>
                </Button>
              </li>
            ) : null}
          </ul>
        </>
      ) : (
        <h3 className="w-full overflow-hidden whitespace-nowrap text-xs font-medium tracking-wide text-gray-400">
          {t('page-conversations:message:no-conversation')}
        </h3>
      )}
    </div>
  );
}
