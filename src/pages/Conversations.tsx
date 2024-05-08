import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { ConversationGrid } from '@/components/ConversationGrid';
import { NewConversationForm } from '@/components/NewConversationForm';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { ModelIcon } from '@/components/ui/icons/ModelIcon';
import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import { useConversationsContext } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';

export default function ConversationsPage() {
  const { models } = useAppStateStore();
  const { conversations, isLoading } = useConversationsContext();
  const { t } = useTranslation(['page-conversations']);
  const hasModels = models.length > 0;
  const hasConversations = conversations.length > 0;

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
    return null;
  }

  return (
    <SlideUpTransition motionKey="conversations">
      <TwoRows className="max-h-screen">
        <TwoRows.Top>
          <TitleBar title={t('page-conversations:title')} />
        </TwoRows.Top>
        <TwoRows.Bottom className="flex overflow-hidden">
          <ScrollArea className="w-full grow">
            <div className="flex grow justify-center">
              <div className="flex w-[1080px] max-w-[1080px] flex-col px-[34px]">
                {hasModels ? render() : renderEmptyModels()}
              </div>
            </div>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
