import { useQueryClient } from '@tanstack/react-query';

import TwoRows from '@/layouts/TwoRows';
import { LIST_CONVERSATIONS_KEY } from '@/lib/hooks';
import log from '@/lib/log';
import type { Conversation } from '@/lib/types';

import { TitleBar } from './TitleBar';

type Props = {
  conversation: Conversation;
};

export default function Chat({ conversation }: Props) {
  log.info('Chat rendered!');
  const queryClient = useQueryClient();
  return (
    <TwoRows.Root>
      <TwoRows.Top>
        <TitleBar title={conversation.subject} />
      </TwoRows.Top>
      <TwoRows.Bottom>
        <ul>
          <li>Message 1</li>
          <li>Message 2</li>
          <li>Message 3</li>
          <li>Message 4</li>
          <li>Message 5</li>
          <li>
            <button
              type="button"
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: LIST_CONVERSATIONS_KEY,
                });
              }}
            >
              Test
            </button>
          </li>
        </ul>
      </TwoRows.Bottom>
    </TwoRows.Root>
  );
}
