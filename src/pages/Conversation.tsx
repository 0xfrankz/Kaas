import { useParams } from 'react-router-dom';

import { parseNumberOrNull } from '@/lib/utils';

type Params = {
  conversationId: string;
};

export default function ConversationPage() {
  const { conversationId } = useParams<Params>();
  const cid = parseNumberOrNull(conversationId);
  if (cid === null) {
    throw Error('Oops, the required conversation is missing...');
  }
  return <div>Conversation Page: {conversationId}</div>;
}
