import { useTranslation } from 'react-i18next';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { ConversationGrid } from '@/components/Conversations/ConversationGrid';
import { NewConversationForm } from '@/components/Conversations/NewConversationForm';
import NoModel from '@/components/Conversations/NoModel';
import { TitleBar } from '@/components/TitleBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import { useConversationsContext } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';

export default function ConversationsPage() {
  const { models } = useAppStateStore();
  const { conversations, isLoading } = useConversationsContext();
  const { t } = useTranslation(['page-conversations']);
  const hasModels = models.length > 0;

  const render = () => {
    return (
      <>
        <div className="w-full px-4 md:px-8">
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
      <TwoRows className="h-screen max-h-screen">
        <TwoRows.Top>
          <TitleBar title={t('page-conversations:title')} />
        </TwoRows.Top>
        <TwoRows.Bottom className="flex overflow-hidden">
          <ScrollArea className="grow">
            <div className="mx-auto mb-6 mt-12 flex flex-col">
              {hasModels ? render() : <NoModel />}
            </div>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
