import { Link } from 'react-router-dom';

import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { ModelIcon } from '@/components/ui/icons/ModelIcon';
import { useAppStateStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function CoversationsPage() {
  const { models } = useAppStateStore();
  const hasModels = models.length > 0;

  const renderNoModelsView = () => {
    return (
      <>
        <h2 className="text-3xl font-semibold">
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

  return (
    <>
      <TitleBar title="Conversations" />
      <div className="flex grow justify-center">
        <div className="w-[1080px] max-w-[1080px]">
          <div
            className={cn(
              'flex flex-col px-[34px] min-h-[348px]',
              hasModels ? 'mt-6' : 'mt-48 items-center'
            )}
          >
            {hasModels ? <h1>Models</h1> : renderNoModelsView()}
          </div>
        </div>
      </div>
    </>
  );
}
