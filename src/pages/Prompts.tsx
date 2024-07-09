import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Suspense, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import PromptFormDialog from '@/components/PromptFormDialog';
import { PromptGrid } from '@/components/PromptGrid';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import { LIST_PROMPTS_KEY, usePromptCreator } from '@/lib/hooks';
import type { DialogHandler, NewPrompt, Prompt } from '@/lib/types';

function PageTitle() {
  const { t } = useTranslation('page-prompts');
  return <TitleBar title={t('title')} />;
}

export default function PromptsPage() {
  const { t } = useTranslation(['generic', 'page-prompts']);
  const newPromptDialogRef = useRef<DialogHandler<undefined>>(null);

  const queryClient = useQueryClient();
  const creator = usePromptCreator({
    onSuccess: async (prompt) => {
      // Update cache
      queryClient.setQueryData<Prompt[]>(LIST_PROMPTS_KEY, (old) =>
        old ? [...old, prompt] : [prompt]
      );
      // Show toast
      toast.success(t('page-prompts:message:create-prompt-success'));
      // Close dialog
      newPromptDialogRef.current?.close();
    },
    onError: async (error, variables) => {
      toast.error(`Failed to create prompt: ${error.message}`);
    },
  });

  const onCreateClick = useCallback(() => {
    newPromptDialogRef.current?.open();
  }, []);

  const onCreateSubmit = useCallback(
    (newPrompt: NewPrompt) => {
      creator(newPrompt);
    },
    [creator]
  );

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
              <div className="mx-auto mb-6 mt-12 w-[1080px] max-w-[1080px]">
                <div className="flex justify-between">
                  <h2 className="text-3xl font-semibold tracking-tight">
                    {t('page-prompts:section:your-prompts')}
                  </h2>
                  <Button onClick={onCreateClick}>
                    <Plus className="size-4" />
                    <span className="ml-2">
                      {t('generic:action:create-prompt')}
                    </span>
                  </Button>
                </div>
                <PromptGrid />
              </div>
            </Suspense>
          </ScrollArea>
          <PromptFormDialog.New
            ref={newPromptDialogRef}
            onSubmit={onCreateSubmit}
          />
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
