import dayjs from 'dayjs';
import { Calendar, MessageCircle, Play, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import { useConversationDeleter } from '@/lib/hooks';
import log from '@/lib/log';
import { useConfirmationStateStore } from '@/lib/store';
import type { Conversation } from '@/lib/types';

import { ProviderTag } from './ProviderTag';
import { Button } from './ui/button';
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
  const { open } = useConfirmationStateStore();
  const deleter = useConversationDeleter({
    onSettled: async (ignored, error, variables) => {
      if (!error) {
        toast.success(
          t('page-conversations:message:delete-conversation-success')
        );
      } else {
        await log.error(
          `Failed to delete conversation: data = ${JSON.stringify(variables)}, error = ${error.message}`
        );
        toast.error(
          t('page-conversations:message:delete-conversation-error', {
            errorMsg: error.message,
          })
        );
      }
    },
  });

  const onDeleteClick = (conversation: Conversation) => {
    open({
      title: t('generic:message:are-you-sure'),
      message: t('page-conversations:message:delete-conversation-warning'),
      onConfirm: () => {
        deleter(conversation.id);
      },
    });
  };

  return (
    <div className="flex grow flex-col">
      <div className="flex justify-between">
        <h2 className="text-3xl font-semibold tracking-tight">
          {conversations.length} conversations
        </h2>
        <Button onClick={() => navigate(`/conversations/new`)}>
          <Plus className="size-4" />
          <span className="ml-2">
            {t('generic:action:start-new-conversation')}
          </span>
        </Button>
      </div>
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
                  onClick={() => {
                    onDeleteClick(conversation);
                  }}
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
