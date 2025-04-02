import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { SlideLeftTransition } from '@/components/animation/SlideLeftTransition';
import { ChatSection } from '@/components/Conversation/ChatSection';
import TwoColumns from '@/layouts/TwoColumns';
import { AppError, ERROR_TYPE_APP_STATE } from '@/lib/error';
import { useConversationsContext } from '@/lib/hooks';
import type { ConversationDetails } from '@/lib/types';
import { errorGuard, parseNumberOrNull } from '@/lib/utils';

type Params = {
  conversationId: string;
};

function ConversationPage() {
  const { conversationId } = useParams<Params>();
  const { t } = useTranslation(['error']);
  const cid = parseNumberOrNull(conversationId);
  if (cid === null) {
    // redirect to new conversation page?
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      t('error:conversation.invalid-id', { conversationId }),
      t('error:conversation.missing', { conversationId })
    );
  }
  const { get: getConversation } = useConversationsContext();
  const conversation = cid ? getConversation(cid) : null;
  if (!conversation) {
    // parent context is not ready
    return null;
  }

  return (
    <SlideLeftTransition motionKey={`conversation-${conversation.id}`}>
      <TwoColumns className="h-screen grow">
        <TwoColumns.Right className="relative">
          <ChatSection
            conversation={conversation as ConversationDetails}
            key={conversation.id}
          />
        </TwoColumns.Right>
      </TwoColumns>
    </SlideLeftTransition>
  );
}

export default errorGuard(<ConversationPage />);