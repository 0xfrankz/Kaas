import { motion } from 'framer-motion';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useListSubConversationsQuery } from '@/lib/hooks';
import { FileUploaderContextProvider } from '@/lib/providers';
import type { Conversation } from '@/lib/types';

import { ChatStop } from '../ChatStop';
import { ToBottom } from '../ToBottom';
import { Button } from '../ui/button';
import { UserPromptInput } from '../UserPromptInput';
import { Chat } from './Chat';

export function GroupChat({ conversation }: { conversation: Conversation }) {
  const { t } = useTranslation(['page-conversation']);

  // Queries
  const { data: subConversations } = useListSubConversationsQuery(
    conversation.id
  );

  // Derived states
  const receiving = useMemo(() => {
    // if any sub conversation is receiving, return true
    return false;
  }, []);
  const isLastMessageFromUser = useMemo(() => {
    // if any sub conversation's last message is from user, return true
    return false;
  }, []);

  // Callbacks
  const onStopClick = useCallback(async () => {
    // stop all sub conversations through event emitter
    // then update relevant message list data
    console.log('onStopClick');
  }, []);

  const onToBottomClick = useCallback(() => {
    console.log('should onToBottomClick be in Chat.tsx?');
  }, []);

  const onContinueClick = useCallback(() => {
    // insert placeholder the target subconversation to trigger generation
    // then scroll to bottom
    console.log('onContinueClick');
  }, []);

  // Render functions
  const renderBottomSection = () => {
    // when receiving, display stop button
    if (receiving)
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.2, type: 'tween' },
          }}
        >
          <div className="mb-9">
            <ChatStop onClick={onStopClick} />
          </div>
        </motion.div>
      );
    // when the last user message is not replied, display continue button
    if (isLastMessageFromUser)
      return (
        <div id="continue-or-input" className="mb-9">
          <Button
            variant="secondary"
            className="rounded-full drop-shadow-lg"
            onClick={onContinueClick}
          >
            {t('generic:action:continue')}
          </Button>
        </div>
      );
    // other wise, display input & go-to-bottom button
    return (
      <>
        <div id="to-bottom" className="absolute -top-12 mx-auto hidden">
          <ToBottom onClick={onToBottomClick} />
        </div>
        <div id="continue-or-input" className="h-fit w-full">
          <FileUploaderContextProvider>
            <UserPromptInput
              conversation={conversation}
              subConversations={subConversations}
            />
          </FileUploaderContextProvider>
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-full flex-col bg-red-300">
      GroupChat {conversation.id}
      <div className="grow columns-2 gap-5 bg-yellow-300">
        {subConversations?.map((subConversation) => (
          <>
            <div className="bg-green-300">
              Sub Conversation Tab {subConversation.id}
            </div>
            <Chat key={subConversation.id} conversation={subConversation} />
          </>
        ))}
      </div>
      <div className="mx-auto w-full bg-purple-300 px-4 md:w-[640px] md:px-0">
        <div className="relative flex w-full flex-col items-center justify-center">
          {renderBottomSection()}
        </div>
      </div>
    </div>
  );
}
