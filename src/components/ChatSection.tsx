import { memo, useCallback } from 'react';

import TwoRows from '@/layouts/TwoRows';
import { useSubjectUpdater } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import type { ConversationDetails } from '@/lib/types';

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

  // Queries
  const subjectUpdater = useSubjectUpdater();

  const onTitleChange = useCallback(
    (newTitle: string) => {
      subjectUpdater({ conversationId: conversation.id, subject: newTitle });
    },
    [conversation.id, subjectUpdater]
  );

  return (
    <TwoRows className="max-h-screen">
      <TwoRows.Top>
        <MemoizedTitleBar
          conversation={conversation}
          model={model}
          onEditDone={onTitleChange}
        />
      </TwoRows.Top>
      <TwoRows.Bottom className="flex size-full flex-col items-center justify-between overflow-hidden bg-background">
        {model ? (
          <ChatSectionHasModel conversation={conversation} />
        ) : (
          <ChatSectionNoModel conversation={conversation} />
        )}
      </TwoRows.Bottom>
    </TwoRows>
  );
}
