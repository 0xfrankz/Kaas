import { useQueryClient } from '@tanstack/react-query';

import TopMainLayout from '@/layouts/TopMainLayout';
import { LIST_CONVERSATIONS_KEY } from '@/lib/hooks';
import log from '@/lib/log';
import type { Conversation } from '@/lib/types';

type Props = {
  conversation: Conversation;
};

export default function Chat({ conversation }: Props) {
  log.info('Chat rendered!');
  const queryClient = useQueryClient();
  return (
    <div className="grow">
      <TopMainLayout.Root>
        <TopMainLayout.Top>
          {/* <TitleBar title={conversation.subject} /> */}
          <div className="flex size-full items-center justify-center border-b border-gray-300 bg-white">
            <h1 className="h-fit text-lg font-semibold">
              {conversation.subject}
            </h1>
          </div>
        </TopMainLayout.Top>
        <TopMainLayout.Main>
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
        </TopMainLayout.Main>
      </TopMainLayout.Root>
    </div>
  );
}
