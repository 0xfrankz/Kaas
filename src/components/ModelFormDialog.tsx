import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  PROVIDER_AZURE,
  PROVIDER_CLAUDE,
  PROVIDER_OLLAMA,
  PROVIDER_OPENAI,
} from '@/lib/constants';
import type { DialogHandler, Model, NewModel } from '@/lib/types';

import { DeleteWithConfirmation } from './DeleteWithConfirmation';
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
      case PROVIDER_CLAUDE:
        return <ModelForm.Claude.New id="modelForm" onSubmit={onFormSubmit} />;
      case PROVIDER_OLLAMA:
        return <ModelForm.Ollama.New id="modelForm" onSubmit={onFormSubmit} />;
      default:
        return <ModelForm.Azure.New id="modelForm" onSubmit={onFormSubmit} />;
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('page-models:section:create-model', { provider })}
          </DialogTitle>
          <DialogDescription>
            {t('page-models:message:create-model-tips', {
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
      case PROVIDER_AZURE:
        return (
          <ModelForm.Azure.Edit
            id="modelForm"
            model={model}
            onSubmit={onFormSubmit}
          />
        );
      case PROVIDER_CLAUDE:
        return (
          <ModelForm.Claude.Edit
            id="modelForm"
            model={model}
            onSubmit={onFormSubmit}
          />
        );
      case PROVIDER_OLLAMA:
        return (
          <ModelForm.Ollama.Edit
            id="modelForm"
            model={model}
            onSubmit={onFormSubmit}
          />
        );
      default:
        return (
          <ModelForm.OpenAI.Edit
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
          <DialogTitle>{t('page-models:section:update-model')}</DialogTitle>
          <DialogDescription>
            {t('page-models:message:update-model-tips')}
          </DialogDescription>
        </DialogHeader>
        {renderForm()}
        <DialogFooter>
          <DeleteWithConfirmation
            message={t('page-models:message:delete-model-warning')}
            onConfirm={() => onDelete(model)}
          />
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
