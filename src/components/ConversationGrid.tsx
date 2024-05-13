import dayjs from 'dayjs';
import { Calendar, MessageCircle, Play, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import { useConfirmationDialog } from '@/lib/hooks';
import type { Conversation } from '@/lib/types';

import { ProviderTag } from './ProviderTag';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ui/context-menu';

function ConversationGridItem({
  conversation,
}: {
  conversation: Conversation;
}) {
  return (
    <Link to={`/conversations/${conversation.id}`}>
      <Card className="flex h-52 flex-col text-clip hover:shadow-md">
        <CardHeader className="p-4">
          <div className="flex items-center text-xs">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="ml-1 text-muted-foreground">
              {conversation.createdAt
                ? dayjs(conversation.createdAt).format(DEFAULT_DATE_FORMAT)
                : 'Unknown'}
            </span>
            <MessageCircle className="ml-auto size-4 text-muted-foreground" />
            <span className="ml-1 text-muted-foreground">
              {conversation.messageCount}
            </span>
          </div>
        </CardHeader>
        <CardContent className="grow px-4 py-0">
          <p className="">{conversation.subject}</p>
        </CardContent>
        {conversation.modelProvider ? (
          <CardFooter className="p-4">
            <ProviderTag provider={conversation.modelProvider} />
          </CardFooter>
        ) : null}
      </Card>
    </Link>
  );
}
export function ConversationGrid({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setOpen: setDialogOpen } = useConfirmationDialog();

  const onConfirmClick = () => {
    setDialogOpen(true);
  };

  return (
    <div className="flex grow flex-col">
      <h2 className="text-3xl font-semibold tracking-tight">
        {conversations.length} conversations
      </h2>
      <div className="mt-6 grid grid-cols-3 gap-[26px]">
        {conversations.map((conversation) => {
          return (
            <ContextMenu key={conversation.id}>
              <ContextMenuTrigger>
                <ConversationGridItem
                  conversation={conversation}
                  key={conversation.id}
                />
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => navigate(`/conversations/${conversation.id}`)}
                >
                  <Play className="size-4" /> {t('generic:action:continue')}
                </ContextMenuItem>
                <ContextMenuItem
                  className="cursor-pointer gap-2 focus:bg-destructive focus:text-destructive-foreground"
                  onClick={onConfirmClick}
                >
                  <Trash2 className="size-4" /> {t('generic:action:delete')}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <div className="relative flex flex-col gap-1 px-2 py-1.5 text-xs text-muted-foreground outline-none">
                  <span>
                    {t('generic:message:last-message', {
                      lastMessage: conversation.createdAt
                        ? dayjs(conversation.createdAt).format(
                            DEFAULT_DATE_FORMAT
                          )
                        : 'Unknown',
                    })}
                  </span>
                  <span>
                    {t('generic:message:created-at', {
                      createdAt: conversation.createdAt
                        ? dayjs(conversation.createdAt).format(
                            DEFAULT_DATE_FORMAT
                          )
                        : 'Unknown',
                    })}
                  </span>
                </div>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
    </div>
  );
}
