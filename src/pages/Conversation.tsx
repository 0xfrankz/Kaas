import { useParams } from 'react-router-dom';

import { AppError, ERROR_TYPE_APP_STATE } from '@/lib/error';
import { useConversation } from '@/lib/hooks';
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

  const {
    data: conversation,
    isSuccess,
    isError,
    error,
  } = useConversation(cid);

  if (isError && error) {
    throw error;
  }

  return isSuccess && conversation ? (
    <div>
      Conversation Page: {conversationId} {conversation.subject}
    </div>
  ) : null;
}

export default errorGuard(<ConversationPage />);
