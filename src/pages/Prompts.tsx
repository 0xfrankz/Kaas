import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { PromptGrid } from '@/components/PromptGrid';
import NoPrompts from '@/components/Prompts/NoPrompts';
import { PromptCreator } from '@/components/Prompts/PromptCreator';
import SectionTitle from '@/components/SectionTitle';
import { TitleBar } from '@/components/TitleBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import { useListPromptsQuery } from '@/lib/hooks';

function PageTitle() {
  const { t } = useTranslation('page-prompts');
  return <TitleBar title={t('title')} />;
}

export default function PromptsPage() {
  const { t } = useTranslation(['generic', 'page-prompts']);

  // Queries
  const { data: prompts } = useListPromptsQuery();

  const hasPrompts = prompts && prompts.length > 0;

  return (
    <SlideUpTransition motionKey="prompts">
      <TwoRows className="h-screen max-h-screen">
        <TwoRows.Top>
          <Suspense fallback={null}>
            <PageTitle />
          </Suspense>
        </TwoRows.Top>
        <TwoRows.Bottom className="flex overflow-hidden">
          <ScrollArea className="grow">
            <div className="mx-4 mb-6 mt-12 flex flex-col md:mx-8">
              {hasPrompts ? (
                <>
                  <div className="flex justify-between">
                    <SectionTitle>
                      {t('page-prompts:section:your-prompts')}
                    </SectionTitle>
                    <PromptCreator />
                  </div>
                  <PromptGrid prompts={prompts} />
                </>
              ) : (
                <NoPrompts />
              )}
            </div>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
