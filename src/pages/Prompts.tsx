import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { PromptGrid } from '@/components/PromptGrid';
import { TitleBar } from '@/components/TitleBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';

function PageTitle() {
  const { t } = useTranslation('page-prompts');
  return <TitleBar title={t('title')} />;
}

export default function PromptsPage() {
  const { t } = useTranslation(['generic', 'page-prompts']);
  return (
    <SlideUpTransition motionKey="prompts">
      <TwoRows className="max-h-screen">
        <TwoRows.Top>
          <Suspense fallback={null}>
            <PageTitle />
          </Suspense>
        </TwoRows.Top>
        <TwoRows.Bottom className="flex justify-center overflow-hidden bg-background">
          <ScrollArea className="w-full grow">
            <Suspense fallback={null}>
              <div className="mx-auto my-6 w-[1080px] max-w-[1080px]">
                <h2 className="text-3xl font-semibold tracking-tight">
                  {t('page-prompts:section:your-prompts')}
                </h2>
                <PromptGrid />
              </div>
            </Suspense>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
