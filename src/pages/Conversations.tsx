import { Link } from 'react-router-dom';

import { ConversationGrid } from '@/components/ConversationGrid';
import { NewConversationForm } from '@/components/NewConversationForm';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { ModelIcon } from '@/components/ui/icons/ModelIcon';
import { useListConversations } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';

export default function CoversationsPage() {
  const { models } = useAppStateStore();
  const { data: conversations, isSuccess } = useListConversations();
  const hasModels = models.length > 0;
  const hasConversations = conversations && conversations.length > 0;

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
        <div className="my-12">
          <NewConversationForm />
        </div>
        <div className="flex grow items-center justify-center">
          {isSuccess && hasConversations ? (
            <ConversationGrid conversations={conversations} />
          ) : (
            <h2 className="text-3xl font-semibold tracking-tight">
              You have no conversations yet
            </h2>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <TitleBar title="Conversations" />
      <div className="flex grow justify-center">
        <div className="flex w-[1080px] max-w-[1080px] flex-col px-[34px]">
          {hasModels ? render() : renderEmptyModels()}
        </div>
      </div>
    </>
  );
}
