import { Trash2 } from 'lucide-react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PROVIDER_OPENAI } from '@/lib/constants';
import type { DialogHandler, Model, NewModel } from '@/lib/types';

import ModelForm from './forms/ModelForm';
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
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

type NewModelDialogProps = {
  onSubmit: (model: NewModel) => void;
};

type EditModelDialogProps = {
  onSubmit: (model: Model) => void;
  onDelete: (model: Model) => void;
};

const NewModelFormDialog = forwardRef<
  DialogHandler<string>,
  NewModelDialogProps
>(({ onSubmit }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const [provider, setProvider] = useState<String>();
  const { t } = useTranslation(['generic']);

  useImperativeHandle(ref, () => ({
    open: (defaultValue?: string) => {
      setProvider(defaultValue);
      setShowDialog(true);
    },
    close: () => {
      setProvider(undefined);
      setShowDialog(false);
    },
  }));

  const onFormSubmit = (model: NewModel) => {
    onSubmit(model);
    setShowDialog(false);
  };

  const renderForm = () => {
    switch (provider) {
      case PROVIDER_OPENAI:
        return <ModelForm.OpenAI.New id="modelForm" onSubmit={onFormSubmit} />;
      default:
        return <ModelForm.Azure.New id="modelForm" onSubmit={onFormSubmit} />;
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('generic:text:model-form-title', { provider })}
          </DialogTitle>
          <DialogDescription>
            {t('generic:text:model-form-description', {
              provider,
            })}
          </DialogDescription>
        </DialogHeader>
        {renderForm()}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t('generic:action:cancel')}</Button>
          </DialogClose>
          <Button form="modelForm">{t('generic:action:save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

const EditModelFormDialog = forwardRef<
  DialogHandler<Model>,
  EditModelDialogProps
>(({ onSubmit, onDelete }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const [model, setModel] = useState<Model>();
  const { t } = useTranslation(['page-models']);

  useImperativeHandle(ref, () => ({
    open: (defaultValue?: Model) => {
      setModel(defaultValue);
      setShowDialog(true);
    },
    close: () => {
      setModel(undefined);
      setShowDialog(false);
    },
  }));

  const onFormSubmit = (updatedModel: Model) => {
    onSubmit(updatedModel);
    setShowDialog(false);
  };

  const renderForm = () => {
    if (!model) return null;
    switch (model.provider) {
      case PROVIDER_OPENAI:
        return (
          <ModelForm.OpenAI.Edit
            id="modelForm"
            model={model}
            onSubmit={onFormSubmit}
          />
        );
      default:
        return (
          <ModelForm.Azure.Edit
            id="modelForm"
            model={model}
            onSubmit={onFormSubmit}
          />
        );
    }
  };

  return model ? (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('page-prompts:section:create-prompt')}</DialogTitle>
          <DialogDescription>
            {t('page-prompts:message:create-prompt-tips')}
          </DialogDescription>
        </DialogHeader>
        {renderForm()}
        <DialogFooter>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="mr-auto text-red-600 hover:bg-red-100 hover:text-red-800"
              >
                <Trash2 className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="whitespace-pre-wrap text-sm">
                {t('page-prompts:message:delete-prompt-warning')}
              </div>
              <div className="mt-2 flex justify-center gap-2">
                <PopoverClose asChild>
                  <Button variant="secondary">
                    {t('generic:action:cancel')}
                  </Button>
                </PopoverClose>
                <Button variant="destructive" onClick={() => onDelete(model)}>
                  {t('generic:action:confirm')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <DialogClose asChild>
            <Button variant="secondary">{t('generic:action:cancel')}</Button>
          </DialogClose>
          <Button form="modelForm">{t('generic:action:save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;
});

export default {
  New: NewModelFormDialog,
  Edit: EditModelFormDialog,
};
