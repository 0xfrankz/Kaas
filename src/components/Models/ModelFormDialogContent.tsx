import { useTranslation } from 'react-i18next';

import {
  PROVIDER_AZURE,
  PROVIDER_CLAUDE,
  PROVIDER_CUSTOM,
  PROVIDER_OLLAMA,
} from '@/lib/constants';
import type { AllProviders, NewModel } from '@/lib/types';

import ModelForm from '../forms/ModelForm';
import NumberedBullet from '../NumberedBullet';
import { Button } from '../ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

type Props = {
  provider: AllProviders;
  onResetClick: () => void;
  onFormSubmit: (model: NewModel) => void;
};
export default function ModelFormDialogContent({
  provider,
  onResetClick,
  onFormSubmit,
}: Props) {
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
        <DialogDescription>
          {t('page-models:message:create-model-tips', {
            provider,
          })}
        </DialogDescription>
      </DialogHeader>
      {form}
      <DialogFooter>
        <Button variant="secondary" onClick={onResetClick}>
          {t('generic:action:change-provider')}
        </Button>
        <Button form="modelForm">{t('generic:action:save')}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
