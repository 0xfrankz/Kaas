import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { DialogHandler, NewPrompt } from '@/lib/types';

import PromptForm from './forms/PromptForm';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type DialogProps = {
  onSubmit: (newPrompt: NewPrompt) => void;
};
const NewPromptFormDialog = forwardRef<DialogHandler, DialogProps>(
  ({ onSubmit }, ref) => {
    const [showDialog, setShowDialog] = useState(false);
    const { t } = useTranslation(['page-prompts']);

    useImperativeHandle(ref, () => ({
      open: () => setShowDialog(true),
      close: () => setShowDialog(false),
    }));

    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('page-prompts:section:create-prompt')}</DialogTitle>
            <DialogDescription>
              {t('page-prompts:message:create-prompt-tips')}
            </DialogDescription>
          </DialogHeader>
          <PromptForm.New id="promptForm" onSubmit={onSubmit} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">{t('generic:button:cancel')}</Button>
            </DialogClose>
            <Button form="promptForm">{t('generic:button:save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

export default {
  New: NewPromptFormDialog,
};
