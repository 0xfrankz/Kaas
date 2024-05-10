import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { DialogHandler, NewPrompt, Prompt } from '@/lib/types';

import { DeleteWithConfirmation } from './DeleteWithConfirmation';
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

type NewPromptDialogProps = {
  onSubmit: (newPrompt: NewPrompt) => void;
};

type EditPromptDialogProps = {
  onSubmit: (prompt: Prompt) => void;
  onDeleteClick: (prompt: Prompt) => void;
};

const NewPromptFormDialog = forwardRef<
  DialogHandler<undefined>,
  NewPromptDialogProps
>(({ onSubmit }, ref) => {
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
          <div className="whitespace-pre-wrap text-sm text-muted-foreground">
            <Markdown remarkPlugins={[remarkGfm]}>
              {t('page-prompts:message:create-prompt-tips')}
            </Markdown>
          </div>
        </DialogHeader>
        <PromptForm.New id="promptForm" onSubmit={onSubmit} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t('generic:action:cancel')}</Button>
          </DialogClose>
          <Button form="promptForm">{t('generic:action:save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

const EditPromptFormDialog = forwardRef<
  DialogHandler<Prompt>,
  EditPromptDialogProps
>(({ onSubmit, onDeleteClick }, ref) => {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('page-prompts:section:update-prompt')}</DialogTitle>
          <DialogDescription>
            <Markdown remarkPlugins={[remarkGfm]}>
              {t('page-prompts:message:create-prompt-tips')}
            </Markdown>
          </DialogDescription>
        </DialogHeader>
        <PromptForm.Edit
          id="promptForm"
          onSubmit={onSubmit}
          defaultValues={prompt}
        />
        <DialogFooter>
          <DeleteWithConfirmation
            message={t('page-prompts:message:delete-prompt-warning')}
            onConfirm={() => onDeleteClick(prompt)}
          />
          <DialogClose asChild>
            <Button variant="secondary">{t('generic:action:cancel')}</Button>
          </DialogClose>
          <Button form="promptForm">{t('generic:action:save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;
});

export default {
  New: NewPromptFormDialog,
  Edit: EditPromptFormDialog,
};
