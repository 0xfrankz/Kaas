import { useParams } from 'react-router-dom';

import ChatSection from '@/components/ChatSection';
import { ConversationHistory } from '@/components/ConversationHistory';
import TwoColumns from '@/layouts/TwoColumns';
import { AppError, ERROR_TYPE_APP_STATE } from '@/lib/error';
import { useConversationsContext } from '@/lib/hooks';
import log from '@/lib/log';
import type { Conversation } from '@/lib/types';
import { errorGuard, parseNumberOrNull } from '@/lib/utils';

type Params = {
  conversationId: string;
};

function ConversationPage() {
  log.info('ConversationPage rendered!');
  const { conversationId } = useParams<Params>();
  const { get: getConversation } = useConversationsContext();
  const cid = parseNumberOrNull(conversationId);
  const conversation = cid ? getConversation(cid) : null;
  if (cid === null) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      `${conversationId} is not a valid number`,
      `Oops, the conversation with id = ${conversationId} is missing`
    );
  }
  if (!conversation) {
    // parent context is not ready
    return null;
  }

  return (
    <TwoColumns>
      <TwoColumns.Left>
        <ConversationHistory activeConversationId={cid} />
      </TwoColumns.Left>
      <TwoColumns.Right>
        <ChatSection conversation={conversation as Conversation} />
      </TwoColumns.Right>
    </TwoColumns>
  );
}

export default errorGuard(<ConversationPage />);
