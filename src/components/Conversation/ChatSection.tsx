import { useQueryClient } from '@tanstack/react-query';
import { ListRestart } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import TwoRows from '@/layouts/TwoRows';
import {
  LIST_MESSAGES_KEY,
  useMessagesHardDeleter,
  useSubjectUpdater,
} from '@/lib/hooks';
import { useAppStateStore, useConfirmationStateStore } from '@/lib/store';
import type { ConversationDetails } from '@/lib/types';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';
import { ChatSectionHasModel } from './ChatSectionHasModel';
import { ChatSectionNoModel } from './ChatSectionNoModel';
import { ConversationTitleBar } from './ConversationTitleBar';

const MemoizedTitleBar = memo(ConversationTitleBar);

type Props = {
  conversation: ConversationDetails;
};

export function ChatSection({ conversation }: Props) {
  const model = useAppStateStore((state) =>
    state.models.find((m) => m.id === conversation.modelId)
  );
  const { t } = useTranslation();
  const { open } = useConfirmationStateStore();

  // Queries
  const queryClient = useQueryClient();
  const subjectUpdater = useSubjectUpdater();
  const deleter = useMessagesHardDeleter({
    onSettled: (_, error) => {
      if (error) {
        toast.error(
          t('page-conversation:message:restart-conversation-error', {
            errorMsg: error.message,
          })
        );
      } else {
        queryClient.setQueryData(
          [...LIST_MESSAGES_KEY, { conversationId: conversation.id }],
          () => {
            return [];
          }
        );
        toast.success(
          t('page-conversation:message:restart-conversation-success')
        );
      }
    },
  });

  // Callbacks
  const onRestartClick = () => {
    open({
      title: t('generic:message:are-you-sure'),
      message: t('page-conversation:message:restart-conversation-warning'),
      onConfirm: () => {
        deleter(conversation.id);
      },
    });
  };

  const onTitleChange = useCallback(
    (newTitle: string) => {
      subjectUpdater({ conversationId: conversation.id, subject: newTitle });
    },
    [conversation.id, subjectUpdater]
  );

  return (
    <TwoRows className="h-screen max-h-screen">
      <TwoRows.Top>
        <MemoizedTitleBar
          conversation={conversation}
          model={model}
          onEditDone={onTitleChange}
        />
      </TwoRows.Top>
      <TwoRows.Bottom className="flex size-full flex-col items-center justify-between overflow-hidden bg-background">
        {model ? (
          <ContextMenu>
            <ContextMenuTrigger className="flex size-full flex-col items-center justify-between overflow-hidden">
              <ChatSectionHasModel conversation={conversation} />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                className="cursor-pointer gap-2"
                onClick={onRestartClick}
              >
                <ListRestart className="size-4" /> {t('generic:action:restart')}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ) : (
          <ChatSectionNoModel conversation={conversation} />
        )}
      </TwoRows.Bottom>
    </TwoRows>
  );
}
