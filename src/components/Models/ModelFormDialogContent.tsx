import { useTranslation } from 'react-i18next';

import {
  PROVIDER_AZURE,
  PROVIDER_CLAUDE,
  PROVIDER_CUSTOM,
  PROVIDER_OLLAMA,
} from '@/lib/constants';
import type { AllProviders, Model, NewModel } from '@/lib/types';

import { DeleteWithConfirmation } from '../DeleteWithConfirmation';
import ModelForm from '../forms/ModelForm';
import NumberedBullet from '../NumberedBullet';
import { Button } from '../ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

type NewModelFormDialogContentProps = {
  provider: AllProviders;
  onResetClick: () => void;
  onFormSubmit: (model: NewModel) => void;
};

type EditModelFormDialogContentProps = {
  model: Model;
  onFormSubmit: (model: Model) => void;
  onDelete: (model: Model) => void;
};

function NewModelFormDialogContent({
  provider,
  onResetClick,
  onFormSubmit,
}: NewModelFormDialogContentProps) {
  const { t } = useTranslation();
  let form = null;
  switch (provider) {
    case PROVIDER_AZURE:
      form = <ModelForm.Azure.New id="modelForm" onSubmit={onFormSubmit} />;
      break;
    case PROVIDER_CLAUDE:
      form = <ModelForm.Claude.New id="modelForm" onSubmit={onFormSubmit} />;
      break;
    case PROVIDER_OLLAMA:
      form = <ModelForm.Ollama.New id="modelForm" onSubmit={onFormSubmit} />;
      break;
    case PROVIDER_CUSTOM:
      form = <ModelForm.CUSTOM.New id="modelForm" onSubmit={onFormSubmit} />;
      break;
    default:
      form = <ModelForm.OpenAI.New id="modelForm" onSubmit={onFormSubmit} />;
  }
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <NumberedBullet number={2} />
          {t('page-models:section:create-model', { provider })}
        </DialogTitle>
        <DialogDescription className="ml-10 text-left">
          {t('page-models:message:create-model-tips', {
            provider,
          })}
        </DialogDescription>
      </DialogHeader>
      {form}
      <DialogFooter className="gap-4">
        <Button variant="secondary" onClick={onResetClick}>
          {t('generic:action:change-provider')}
        </Button>
        <Button form="modelForm">{t('generic:action:save')}</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function EditModelFormDialogContent({
  model,
  onFormSubmit,
  onDelete,
}: EditModelFormDialogContentProps) {
  const { t } = useTranslation();
  let form = null;
  switch (model.provider) {
    case PROVIDER_AZURE:
      form = (
        <ModelForm.Azure.Edit
          id="modelForm"
          model={model}
          onSubmit={onFormSubmit}
        />
      );
      break;
    case PROVIDER_CLAUDE:
      form = (
        <ModelForm.Claude.Edit
          id="modelForm"
          model={model}
          onSubmit={onFormSubmit}
        />
      );
      break;
    case PROVIDER_OLLAMA:
      form = (
        <ModelForm.Ollama.Edit
          id="modelForm"
          model={model}
          onSubmit={onFormSubmit}
        />
      );
      break;
    case PROVIDER_CUSTOM:
      form = (
        <ModelForm.CUSTOM.Edit
          id="modelForm"
          model={model}
          onSubmit={onFormSubmit}
        />
      );
      break;
    default:
      form = (
        <ModelForm.OpenAI.Edit
          id="modelForm"
          model={model}
          onSubmit={onFormSubmit}
        />
      );
  }
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          {t('page-models:section:update-model')}
        </DialogTitle>
        <DialogDescription className="text-left">
          {t('page-models:message:update-model-tips')}
        </DialogDescription>
      </DialogHeader>
      {form}
      <DialogFooter className="gap-4">
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
  );
}

export default {
  New: NewModelFormDialogContent,
  Edit: EditModelFormDialogContent,
};
