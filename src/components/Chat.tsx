import { useQueryClient } from '@tanstack/react-query';

import { TopNavLayout } from '@/layouts/TopNavLayout';
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
    <div className="grow">
      <TopNavLayout>
        <TitleBar title={conversation.subject} />
        <div className="flex grow justify-center">
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
        </div>
      </TopNavLayout>
    </div>
  );
}
