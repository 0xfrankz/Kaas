import { motion, useIsPresent } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ConversationGrid } from '@/components/ConversationGrid';
import { NewConversationForm } from '@/components/NewConversationForm';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { ModelIcon } from '@/components/ui/icons/ModelIcon';
import TwoRows from '@/layouts/TwoRows';
import { useConversationsContext } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';

export default function ConversationsPage() {
  const { models } = useAppStateStore();
  const { conversations, isLoading } = useConversationsContext();
  const { t } = useTranslation(['page-conversations']);
  const hasModels = models.length > 0;
  const hasConversations = conversations.length > 0;

  const isPresent = useIsPresent();

  useEffect(() => {
    if (!isPresent) console.log('Conversations has been removed!');
  }, [isPresent]);

  const renderEmptyModels = () => {
    return (
      <>
        <h2 className="text-3xl font-semibold tracking-tight">
          You need to create a model first
        </h2>
        <div className="mt-6">
          <Button type="button" asChild>
            <Link to="/models">
              <ModelIcon className="stroke-white stroke-1" />
              <span className="ml-2">My models</span>
            </Link>
          </Button>
        </div>
      </>
    );
  };

  const render = () => {
    return (
      <>
        <div className="mt-12">
          <NewConversationForm />
        </div>
        <div className="mt-12 flex grow">
          {hasConversations ? (
            <ConversationGrid conversations={conversations} />
          ) : (
            <h2 className="m-auto text-3xl font-semibold tracking-tight">
              You have no conversations yet
            </h2>
          )}
        </div>
      </>
    );
  };

  if (isLoading) {
    // TODO: handle loading state
    return null;
  }

  return (
    <motion.main
      className="flex min-h-screen grow flex-col bg-white"
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, type: 'tween' },
      }}
      exit={{ opacity: 0, transition: { duration: 0.1, type: 'tween' } }}
      key="conversations"
    >
      <TwoRows>
        <TwoRows.Top>
          <TitleBar title={t('page-conversations:title')} />
        </TwoRows.Top>
        <TwoRows.Bottom>
          <div className="flex grow justify-center">
            <div className="flex w-[1080px] max-w-[1080px] flex-col px-[34px]">
              {hasModels ? render() : renderEmptyModels()}
            </div>
          </div>
        </TwoRows.Bottom>
      </TwoRows>
    </motion.main>
  );
}
