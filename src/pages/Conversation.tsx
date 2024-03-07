import { useParams } from 'react-router-dom';

import { AppError, ERROR_TYPE_APP_STATE } from '@/lib/error';
import { useConversationsContext } from '@/lib/hooks';
import { errorGuard, parseNumberOrNull } from '@/lib/utils';

type Params = {
  conversationId: string;
};

function ConversationPage() {
  const { conversationId } = useParams<Params>();
  const { get: getConversation } = useConversationsContext();
  const cid = parseNumberOrNull(conversationId);
  if (cid === null) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      `${conversationId} is not a valid number`,
      `Oops, the conversation with id = ${conversationId} is missing`
    );
  }
  const conversation = getConversation(cid);

  return conversation ? (
    <div>
      Conversation Page: {conversationId} {conversation.subject}
    </div>
  ) : null;
}

export default errorGuard(<ConversationPage />);
