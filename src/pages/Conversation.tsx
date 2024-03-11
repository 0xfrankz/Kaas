import { useParams } from 'react-router-dom';

import Chat from '@/components/Chat';
import { ConversationHistory } from '@/components/ConversationHistory';
import TwoColumns from '@/layouts/TwoColumns';
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
  const conversation = cid ? getConversation(cid) : null;
  if (cid === null || conversation === null) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      `${conversationId} is not a valid number`,
      `Oops, the conversation with id = ${conversationId} is missing`
    );
  }
  const { data: messages, isSuccess } = useListMessages(cid);

  const renderMessages = () => {
    return messages && messages.length ? (
      <Chat conversation={conversation as Conversation} />
    ) : (
      // TODO: handle the corner case of no message in a conversation
      // maybe when user manually deletes all messages?
      <div>No messages</div>
    );
  };
  return (
    <TwoColumns.Root>
      <TwoColumns.Left>
        <ConversationHistory activeConversationId={cid} />
      </TwoColumns.Left>
      <TwoColumns.Right>{isSuccess ? renderMessages() : null}</TwoColumns.Right>
    </TwoColumns.Root>
  );
}

export default errorGuard(<ConversationPage />);
