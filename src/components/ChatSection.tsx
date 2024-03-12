import TwoRows from '@/layouts/TwoRows';
import type { Conversation } from '@/lib/types';

import { ChatMessageList } from './ChatMessageList';
import { ChatPromptInput } from './ChatPromptInput';
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
        <div className="flex size-full flex-col items-center bg-slate-50">
          <div className="w-[640px] grow">
            <ChatMessageList conversationId={conversation.id} />
          </div>
          <div className="w-[640px]">
            <ChatPromptInput />
          </div>
        </div>
      </TwoRows.Bottom>
    </TwoRows.Root>
  );
}
