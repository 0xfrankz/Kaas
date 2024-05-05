import { DialogDescription } from '@radix-ui/react-dialog';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { DialogHandler, Prompt } from '@/lib/types';

import PromptForm from './forms/PromptForm';
import { PromptPreviewer } from './PromptPreviewer';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Separator } from './ui/separator';

type UsePromptDialogProps = {
  onConfirm: () => void;
};

export const PromptUseDialog = forwardRef<
  DialogHandler<Prompt>,
  UsePromptDialogProps
>(({ onConfirm }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const [prompt, setPrompt] = useState<Prompt>();
  const { t } = useTranslation(['page-prompts']);

  useImperativeHandle(ref, () => ({
    open: (defaultValue?: Prompt) => {
      setPrompt(defaultValue);
      setShowDialog(true);
    },
    close: () => {
      setPrompt(undefined);
      setShowDialog(false);
    },
  }));

  return prompt ? (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('page-prompts:section:use-prompt')}</DialogTitle>
          <DialogDescription>
            {t('page-prompts:message:use-prompt-tips')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex">
          <div className="flex-1">
            {prompt.alias}
            <PromptForm.Use
              id="promptForm"
              defaultValues={prompt}
              onSubmit={() => {
                console.log('onSubmit');
              }}
            />
          </div>
          <Separator orientation="vertical" className="mx-2" />
          <div className="flex-1">
            <PromptPreviewer prompt="ojbk" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t('generic:action:cancel')}</Button>
          </DialogClose>
          <Button form="promptForm">{t('generic:action:save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;
});
