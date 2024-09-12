import dayjs from 'dayjs';
import { Calendar, MessageCircle, Play, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DEFAULT_DATE_FORMAT, PROVIDER_UNKNOWN } from '@/lib/constants';
import { useConversationDeleter } from '@/lib/hooks';
import { useConfirmationStateStore } from '@/lib/store';
import type { ConversationDetails } from '@/lib/types';

import { ConversationCreator } from '../ConversationCreator';
import { ProviderTag } from '../ProviderTag';
import SectionTitle from '../SectionTitle';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ui/context-menu';

function ConversationGridItem({
  conversation,
}: {
  conversation: ConversationDetails;
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
          <p className="line-clamp-4">{conversation.subject}</p>
        </CardContent>
        <CardFooter className="p-4">
          <ProviderTag
            provider={conversation.modelProvider ?? PROVIDER_UNKNOWN}
          />
        </CardFooter>
      </Card>
    </Link>
  );
}
export function ConversationGrid({
  conversations,
}: {
  conversations: ConversationDetails[];
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { open } = useConfirmationStateStore();
  const deleter = useConversationDeleter({
    onSettled: async (_data, error, _variables) => {
      if (!error) {
        toast.success(
          t('page-conversations:message:delete-conversation-success')
        );
      } else {
        toast.error(
          t('page-conversations:message:delete-conversation-error', {
            errorMsg: error.message,
          })
        );
      }
    },
  });

  const onDeleteClick = (conversation: ConversationDetails) => {
    open({
      title: t('generic:message:are-you-sure'),
      message: t('page-conversations:message:delete-conversation-warning'),
      onConfirm: () => {
        deleter(conversation.id);
      },
    });
  };

  return (
    <div className="mx-4 flex grow flex-col md:mx-8">
      <div className="flex justify-between">
        <SectionTitle>
          {conversations.length > 0
            ? t('page-conversations:label:num-of-conversations', {
                num: conversations.length,
              })
            : t('page-conversations:message:no-conversation')}
        </SectionTitle>
        <ConversationCreator />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                        : t('generic:label:unknown'),
                    })}
                  </span>
                  <span>
                    {t('generic:message:created-at', {
                      createdAt: conversation.createdAt
                        ? dayjs(conversation.createdAt).format(
                            DEFAULT_DATE_FORMAT
                          )
                        : t('generic:label:unknown'),
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
