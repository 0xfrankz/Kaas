import { useQueryClient } from '@tanstack/react-query';

import TwoRows from '@/layouts/TwoRows';
import { LIST_CONVERSATIONS_KEY, useListMessages } from '@/lib/hooks';
import type { Conversation } from '@/lib/types';

import { TitleBar } from './TitleBar';
import { Button } from './ui/button';

type Props = {
  conversation: Conversation;
};

export default function Chat({ conversation }: Props) {
  // Queries
  const { data: messages, isSuccess } = useListMessages(conversation.id);

  // Render functions
  const renderMessages = () => {
    if (messages) {
      return messages.map((message) => (
        <li key={message.id}>{message.content}</li>
      ));
    }
    // TODO: handle the corner case of no message in a conversation
    // maybe when user manually deletes all messages?
    return <div>No messages</div>;
  };

  const queryClient = useQueryClient();
  return (
    <TwoRows.Root>
      <TwoRows.Top>
        <TitleBar title={conversation.subject} />
      </TwoRows.Top>
      <TwoRows.Bottom>
        <ul>
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
        </ul>
      </TwoRows.Bottom>
    </TwoRows.Root>
  );
}
