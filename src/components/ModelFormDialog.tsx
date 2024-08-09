import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  PROVIDER_AZURE,
  PROVIDER_CLAUDE,
  PROVIDER_CUSTOM,
  PROVIDER_OLLAMA,
  SUPPORTED_PROVIDERS,
} from '@/lib/constants';
import type { DialogHandler, Model, NewModel } from '@/lib/types';

import { DeleteWithConfirmation } from './DeleteWithConfirmation';
import ModelForm from './forms/ModelForm';
import { ProviderCard } from './ProviderCard';
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

const NewModelFormDialog = forwardRef<DialogHandler<void>, NewModelDialogProps>(
  ({ onSubmit }, ref) => {
    const [showDialog, setShowDialog] = useState(false);
    const [provider, setProvider] = useState<String>();
    const { t } = useTranslation(['generic']);

    useImperativeHandle(ref, () => ({
      open: () => {
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

    useEffect(() => {
      if (!showDialog) {
        setProvider(undefined);
      }
    }, [showDialog]);

    const renderProviderGrid = () => {
      return (
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-foreground text-sm">
                1
              </div>
              {t('page-models:section:pick-provider')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6 grid grid-cols-4 gap-5">
            {SUPPORTED_PROVIDERS.map((p) => (
              <ProviderCard
                provider={p}
                onClick={() => {
                  setProvider(p);
                }}
                key={`${p}-model-card`}
              />
            ))}
          </div>
        </DialogContent>
      );
    };

    const renderForm = () => {
      let form = null;
      switch (provider) {
        case PROVIDER_AZURE:
          form = <ModelForm.Azure.New id="modelForm" onSubmit={onFormSubmit} />;
          break;
        case PROVIDER_CLAUDE:
          form = (
            <ModelForm.Claude.New id="modelForm" onSubmit={onFormSubmit} />
          );
          break;
        case PROVIDER_OLLAMA:
          form = (
            <ModelForm.Ollama.New id="modelForm" onSubmit={onFormSubmit} />
          );
          break;
        case PROVIDER_CUSTOM:
          form = (
            <ModelForm.CUSTOM.New id="modelForm" onSubmit={onFormSubmit} />
          );
          break;
        default:
          form = (
            <ModelForm.OpenAI.New id="modelForm" onSubmit={onFormSubmit} />
          );
      }
      return (
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-foreground text-sm">
                2
              </div>
              {t('page-models:section:create-model', { provider })}
            </DialogTitle>
            <DialogDescription>
              {t('page-models:message:create-model-tips', {
                provider,
              })}
            </DialogDescription>
          </DialogHeader>
          {form}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setProvider(undefined)}>
              {t('generic:action:change-provider')}
            </Button>
            <Button form="modelForm">{t('generic:action:save')}</Button>
          </DialogFooter>
        </DialogContent>
      );
    };

    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        {provider ? renderForm() : renderProviderGrid()}
      </Dialog>
    );
  }
);

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
      case PROVIDER_CUSTOM:
        return (
          <ModelForm.CUSTOM.Edit
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
