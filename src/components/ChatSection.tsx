import TwoRows from '@/layouts/TwoRows';
import type { Conversation } from '@/lib/types';

import { ChatMessageList } from './ChatMessageList';
import { TitleBar } from './TitleBar';

type Props = {
  conversation: Conversation;
};

export default function Chat({ conversation }: Props) {
  return (
    <TwoRows.Root>
      <TwoRows.Top>
        <TitleBar title={conversation.subject} />
      </TwoRows.Top>
      <TwoRows.Bottom>
        <ChatMessageList conversationId={conversation.id} />
        {/* <ul>
          {isSuccess ? renderMessages() : null}
          <li>
            <Button
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: LIST_CONVERSATIONS_KEY,
                });
              }}
            >
              Test
            </Button>
          </li>
        </ul> */}
      </TwoRows.Bottom>
    </TwoRows.Root>
  );
}
