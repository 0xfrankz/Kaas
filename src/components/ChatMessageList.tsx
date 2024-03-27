import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { MESSAGE_BOT, MESSAGE_USER } from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useCallBot,
  useCreateMessageMutation,
  useListMessagesQuery,
} from '@/lib/hooks';
import log from '@/lib/log';
import type { Message } from '@/lib/types';

import { BotMessageReceiver } from './BotMessageReceiver';
import ChatMessage from './ChatMessage';
import { useToast } from './ui/use-toast';

type Props = {
  conversationId: number;
  children?: React.ReactNode;
};

export function ChatMessageList({ conversationId, children }: Props) {
  // Queries
  const { data: messages, isSuccess } = useListMessagesQuery(conversationId);
  const createMsgMutation = useCreateMessageMutation();
  const callBotMutation = useCallBot();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Callbacks
  const onNewUserMessage = async (_message: Message) => {
    // call bot
    callBotMutation.mutate(conversationId, {
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
    console.log('onNewBotMessage:', msg);
    createMsgMutation.mutate(
      {
        conversationId,
        role: MESSAGE_BOT,
        content: msg,
      },
      {
        onSuccess(message) {
          // Update cache
          queryClient.setQueryData<Message[]>(
            [...LIST_MESSAGES_KEY, { conversationId }],
            (msgList) => (msgList ? [...msgList, message] : [message])
          );
        },
      }
    );
  };

  useEffect(() => {
    if (isSuccess && messages?.length > 0) {
      const lastMsg = messages.at(-1);
      if (lastMsg?.role === MESSAGE_USER) {
        onNewUserMessage(lastMsg);
      }
    }
  }, [isSuccess, messages]);

  // Render functions
  const renderMessages = () => {
    const inner = messages ? (
      <>
        <ul className="box-border pt-6">
          {messages.map((message) => {
            switch (message.role) {
              case MESSAGE_USER:
                return (
                  <li key={message.id}>
                    <ChatMessage.User key={message.id} message={message} />
                  </li>
                );
              case MESSAGE_BOT:
                return (
                  <li key={message.id}>
                    <ChatMessage.Bot key={message.id} message={message} />
                  </li>
                );
              default:
                return (
                  <li key={message.id}>
                    <ChatMessage.System key={message.id} message={message} />
                  </li>
                );
            }
          })}
        </ul>
        <BotMessageReceiver onMessageReceived={onNewBotMessage} />
        {children}
      </>
    ) : (
      // TODO: handle the corner case of no message in a conversation
      // maybe when user manually deletes all messages?
      <h2>No messages</h2>
    );

    return <div className="w-auto">{inner}</div>;
  };

  return isSuccess ? renderMessages() : null;
}
