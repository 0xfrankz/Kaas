import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useListPromptsQuery } from '@/lib/hooks';
import type { DialogHandler, Prompt } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type GridItemProps = {
  prompt: Prompt;
  onUseClick: (prompt: Prompt) => void;
};
function PromptGridItem({ prompt, onUseClick }: GridItemProps) {
  const { t } = useTranslation(['generic']);
  return (
    <Card className={cn('mb-6 flex break-inside-avoid flex-col')}>
      <CardContent className="flex items-center justify-between p-4">
        <span className="max-w-40 truncate font-medium">{prompt.alias}</span>
        <Button
          className="ml-2"
          onClick={() => {
            onUseClick(prompt);
          }}
        >
          {t('generic:action:use')}
        </Button>
      </CardContent>
    </Card>
  );
}

export const PromptGridDialog = forwardRef<
  DialogHandler<void>,
  {
    onConfirm: () => void;
  }
>(({ onConfirm }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const { t } = useTranslation(['page-conversation']);
  // Queries
  const { data: prompts, isSuccess } = useListPromptsQuery();

  useImperativeHandle(ref, () => ({
    open: () => {
      setShowDialog(true);
    },
    close: () => {
      setShowDialog(false);
    },
  }));

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('page-conversation:section:use-prompt')}</DialogTitle>
          <DialogDescription>
            {t('page-conversation:message:use-prompt-tips')}
          </DialogDescription>
        </DialogHeader>
        <div className="mx-auto mt-6 w-full columns-3 gap-8 text-foreground">
          {isSuccess &&
            prompts.map((prompt) => (
              <PromptGridItem
                key={prompt.id}
                prompt={prompt}
                onUseClick={(p) => console.log(p)}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
});
