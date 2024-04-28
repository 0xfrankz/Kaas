import { PlusIcon } from '@radix-ui/react-icons';
import { useRef, useState } from 'react';

import { PROVIDER_AZURE, PROVIDER_OPENAI } from '@/lib/constants';
import type {
  Model,
  ModelFormHandler,
  NewAzureModel,
  NewModel,
  NewOpenAIModel,
  SupportedProviders,
} from '@/lib/types';

import ModelForm from './forms/ModelForm';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';

type NewFormProps = {
  provider: SupportedProviders;
  onSubmit: (model: NewModel) => void;
};

type EditFormProps = {
  model: Model;
  onSubmit: (model: Model) => void;
};

function NewModelFormDialog({ provider, onSubmit }: NewFormProps) {
  const [showDialog, setShowDialog] = useState(false);
  const formRef = useRef<ModelFormHandler>(null);

  const onFormSubmit = (model: NewModel) => {
    onSubmit(model);
    setShowDialog(false);
  };

  const renderForm = () => {
    switch (provider) {
      case PROVIDER_OPENAI:
        return (
          <ModelForm.OpenAI.New
            model={
              {
                provider: PROVIDER_OPENAI,
                apiKey: '',
                model: '',
              } as NewOpenAIModel
            }
            onSubmit={onFormSubmit}
            ref={formRef}
          />
        );
      default:
        return (
          <ModelForm.Azure.New
            model={
              {
                provider: PROVIDER_AZURE,
                apiKey: '',
                endpoint: '',
                apiVersion: '',
                deploymentId: '',
              } as NewAzureModel
            }
            onSubmit={onFormSubmit}
            ref={formRef}
          />
        );
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="mx-auto w-32">
          <PlusIcon className="size-4 text-primary-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>{renderForm()}</DialogContent>
    </Dialog>
  );
}

export default {
  New: NewModelFormDialog,
};
