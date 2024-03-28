import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useCallBot,
  useCreateMessageMutation,
  useListMessagesQuery,
} from '@/lib/hooks';
import log from '@/lib/log';
import type { Conversation, Message } from '@/lib/types';

import { BotMessageReceiver } from './BotMessageReceiver';
import { ChatMessageList } from './ChatMessageList';
import { ChatPromptInput } from './ChatPromptInput';
import { ScrollBottom } from './ScrollBottom';
import { TitleBar } from './TitleBar';
import { useToast } from './ui/use-toast';

type Props = {
  conversation: Conversation;
};

export function ChatSection({ conversation }: Props) {
  const [listenerReady, setListenerReady] = useState(false); // mark to make sure listener is ready before calling bot
  const viewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Queries
  const { data: messages, isSuccess } = useListMessagesQuery(conversation.id);
  const callBotMutation = useCallBot();
  const createMsgMutation = useCreateMessageMutation();
  const queryClient = useQueryClient();

  // Callbacks
  const onNewUserMessage = async (_message: Message) => {
    // call bot
    callBotMutation.mutate(conversation.id, {
      onSuccess: async () => {
        callBotMutation.reset();
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

  const onNewBotMessage = (msg: string) => {
    createMsgMutation.mutate(
      {
        conversationId: conversation.id,
        role: MESSAGE_BOT,
        content: msg,
      },
      {
        onSuccess(message) {
          // Update cache
          queryClient.setQueryData<Message[]>(
            [...LIST_MESSAGES_KEY, { conversationId: conversation.id }],
            (msgList) => (msgList ? [...msgList, message] : [message])
          );
        },
      }
    );
  };

  useEffect(() => {
    if (isSuccess && messages?.length > 0 && listenerReady) {
      const lastMsg = messages.at(-1);
      if (lastMsg?.role === MESSAGE_USER) {
        onNewUserMessage(lastMsg);
      }
    }
  }, [isSuccess, messages, listenerReady]);

  return (
    <TwoRows className="max-h-screen">
      <TwoRows.Top>
        <TitleBar title={conversation.subject} />
      </TwoRows.Top>
      <TwoRows.Bottom className="flex size-full flex-col items-center overflow-hidden bg-slate-50">
        <ScrollArea className="w-full grow" viewportRef={viewportRef}>
          <div className="mx-auto w-[640px] pb-4">
            {isSuccess && <ChatMessageList messages={messages} />}
            <BotMessageReceiver
              onMessageReceived={onNewBotMessage}
              onReady={() => setListenerReady(true)}
            />
            <ScrollBottom scrollContainerRef={viewportRef} />
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
