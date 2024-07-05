import { Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { ConversationGrid } from '@/components/ConversationGrid';
import { NewConversationForm } from '@/components/NewConversationForm';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import { useConversationsContext } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';

export default function ConversationsPage() {
  const { models } = useAppStateStore();
  const { conversations, isLoading } = useConversationsContext();
  const { t } = useTranslation(['page-conversations']);
  const hasModels = models.length > 0;

  const renderEmptyModels = () => {
    return (
      <div className="flex min-h-[348px] flex-col items-center justify-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          {t('page-conversations:message:no-model')}
        </h2>
        <div className="mt-6">
          <Button type="button" asChild>
            <Link to="/models">
              <Package className="size-4" />
              <span className="ml-2">{t('generic:action:create-a-model')}</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  const render = () => {
    return (
      <>
        <div>
          <NewConversationForm />
        </div>
        <div className="mt-12 flex grow">
          <ConversationGrid conversations={conversations} />
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
            <div className="mx-auto mb-6 mt-12 flex w-[1080px] max-w-[1080px] flex-col">
              {hasModels ? render() : renderEmptyModels()}
            </div>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
