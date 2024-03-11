import { useParams } from 'react-router-dom';

import Chat from '@/components/Chat';
import { ConversationHistory } from '@/components/ConversationHistory';
import { AppError, ERROR_TYPE_APP_STATE } from '@/lib/error';
import { useConversationsContext, useListMessages } from '@/lib/hooks';
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
  if (cid === null) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      `${conversationId} is not a valid number`,
      `Oops, the conversation with id = ${conversationId} is missing`
    );
  }
  const conversation = getConversation(cid);
  const { data: messages, isSuccess } = useListMessages(cid);

  const renderMessages = () => {
    return messages && messages.length ? (
      <Chat conversation={conversation as Conversation} />
    ) : (
      <div>No messages</div>
    );
  };
  return conversation ? (
    <div className="flex grow">
      <ConversationHistory activeConversationId={cid} />
      {isSuccess ? renderMessages() : null}
    </div>
  ) : null;
}

export default errorGuard(<ConversationPage />);
