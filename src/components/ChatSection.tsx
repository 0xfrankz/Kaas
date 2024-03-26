import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import { useCallBotNew } from '@/lib/hooks';
import log from '@/lib/log';
import type { Conversation, Message } from '@/lib/types';

import { ChatMessageList } from './ChatMessageList';
import { ChatPromptInput } from './ChatPromptInput';
import { ScrollBottom } from './ScrollBottom';
import { TitleBar } from './TitleBar';
import { useToast } from './ui/use-toast';

type Props = {
  conversation: Conversation;
};

export function ChatSection({ conversation }: Props) {
  const [botLoading, setBotLoading] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const callBotMutation = useCallBotNew();
  const viewportRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Callbacks
  const onNewUserMessage = async (_message: Message) => {
    setBotLoading(true);
    // call bot
    callBotMutation.mutate(conversation.id, {
      onSuccess: async () => {
        callBotMutation.reset();
        // start receiving replies from backend
        setReceiving(true);
      },
      onError: async (error) => {
        const errMsg = `Bot call failed: ${error.message}`;
        await log.error(errMsg);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errMsg,
        });
      },
    });
  };

  return (
    <TwoRows className="max-h-screen">
      <TwoRows.Top>
        <TitleBar title={conversation.subject} />
      </TwoRows.Top>
      <TwoRows.Bottom className="flex size-full flex-col items-center overflow-hidden bg-slate-50">
        <ScrollArea className="w-full grow" viewportRef={viewportRef}>
          <div className="mx-auto w-[640px] pb-4">
            <ChatMessageList
              conversationId={conversation.id}
              onNewUserMessage={onNewUserMessage}
            >
              {/* {botLoading && <ChatMessage.BotLoading />} */}
              {/* {activeBotMessage} */}
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
