import { useParams } from 'react-router-dom';

import { ChatSection } from '@/components/ChatSection';
import { ConversationHistory } from '@/components/ConversationHistory';
import { ConversationOptionsDialog } from '@/components/ConversationOptionsDialog';
import TwoColumns from '@/layouts/TwoColumns';
import { AppError, ERROR_TYPE_APP_STATE } from '@/lib/error';
import { useConversationsContext } from '@/lib/hooks';
import type { Conversation } from '@/lib/types';
import { errorGuard, parseNumberOrNull } from '@/lib/utils';

type Params = {
  conversationId: string;
};

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
    // parent context is not ready
    return null;
  }

  return (
    <TwoColumns>
      <TwoColumns.Left>
        <ConversationHistory activeConversationId={cid} />
      </TwoColumns.Left>
      <TwoColumns.Right className="relative">
        <ChatSection
          conversation={conversation as Conversation}
          key={conversation.id}
        />
        <ConversationOptionsDialog
          conversation={conversation}
          className="absolute bottom-[38px] right-10 size-9 rounded-full p-0 shadow"
        />
      </TwoColumns.Right>
    </TwoColumns>
  );
}

export default errorGuard(<ConversationPage />);
