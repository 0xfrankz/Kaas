import { useRef } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import type { Conversation } from '@/lib/types';

import { ChatMessageList } from './ChatMessageList';
import { ChatPromptInput } from './ChatPromptInput';
import { ScrollBottom } from './ScrollBottom';
import { TitleBar } from './TitleBar';

type Props = {
  conversation: Conversation;
};

export function ChatSection({ conversation }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <TwoRows className="max-h-screen">
      <TwoRows.Top>
        <TitleBar title={conversation.subject} />
      </TwoRows.Top>
      <TwoRows.Bottom className="flex size-full flex-col items-center overflow-hidden bg-slate-50">
        <ScrollArea className="w-full grow" viewportRef={viewportRef}>
          <div className="mx-auto w-[640px] pb-4">
            <ChatMessageList conversationId={conversation.id}>
              <ScrollBottom scrollContainerRef={viewportRef} />
            </ChatMessageList>
          </div>
        </ScrollArea>
        <div className="mt-4 w-full">
          <div className="mx-auto w-[640px]">
            <ChatPromptInput conversationId={conversation.id} />
          </div>
        </div>
      </TwoRows.Bottom>
    </TwoRows>
  );
}
