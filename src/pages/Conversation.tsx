import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { SlideLeftTransition } from '@/components/animation/SlideLeftTransition';
import { ConversationTitleBar } from '@/components/Conversation/ConversationTitleBar';
import { GroupChat } from '@/components/Conversation/GroupChat';
import { NoModel } from '@/components/Conversation/NoModel';
import { SingleChat } from '@/components/Conversation/SingleChat';
import TwoRows from '@/layouts/TwoRows';
import { AppError, ERROR_TYPE_APP_STATE } from '@/lib/error';
import { useConversationsContext, useSubjectUpdater } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import { errorGuard, parseNumberOrNull } from '@/lib/utils';

type Params = {
  conversationId: string;
};

const MemoizedTitleBar = memo(ConversationTitleBar);

function ConversationPage() {
  const { conversationId } = useParams<Params>();
  const cid = parseNumberOrNull(conversationId);
  if (cid === null) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      `${conversationId} is not a valid number`,
      `Oops, the conversation with id = ${conversationId} is missing`
    );
  }
  const { get: getConversation } = useConversationsContext();
  const conversation = cid ? getConversation(cid) : null;
  if (!conversation) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      `Conversation with id = ${conversationId} does not exist`,
      `Oops, the conversation with id = ${conversationId} is missing`
    );
  }
  const model = useAppStateStore((state) =>
    state.models.find((m) => m.id === conversation.modelId)
  );
  const { t } = useTranslation();

  const mode: 'single-model' | 'multi-model' | 'no-model' = useMemo(() => {
    if (conversation.isMultiModels) {
      return 'multi-model';
    }
    if (model) {
      return 'single-model';
    }
    return 'no-model';
  }, [conversation, model]);

  // Queries
  const subjectUpdater = useSubjectUpdater();

  // Callbacks
  const onTitleChange = useCallback(
    (newTitle: string) => {
      subjectUpdater({ conversationId: conversation.id, subject: newTitle });
    },
    [conversation.id, subjectUpdater]
  );

  // Render functions
  const render = () => {
    switch (mode) {
      case 'single-model':
        return <SingleChat conversation={conversation} />;
      case 'multi-model':
        return <GroupChat conversation={conversation} />;
      default:
        return <NoModel conversation={conversation} />;
    }
  };

  return (
    <SlideLeftTransition motionKey={`conversation-${conversation.id}`}>
      <TwoRows className="h-screen max-h-screen">
        <TwoRows.Top>
          <MemoizedTitleBar
            conversation={conversation}
            model={model}
            onEditDone={onTitleChange}
          />
        </TwoRows.Top>
        <TwoRows.Bottom className="flex size-full flex-col items-center justify-between overflow-hidden bg-background">
          {render()}
        </TwoRows.Bottom>
      </TwoRows>
    </SlideLeftTransition>
  );
}

export default errorGuard(<ConversationPage />);
