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
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<ModelFormHandler>(null);

  // Callbacks
  const toggleModal = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      formRef.current?.reset();
    }
  };

  const onFormSubmit = (model: NewModel) => {
    onSubmit(model);
    toggleModal(false);
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
          />
        );
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={toggleModal}>
      <DialogTrigger asChild>
        <Button className="mx-auto w-32 bg-slate-900">
          <PlusIcon className="size-4 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent>{renderForm()}</DialogContent>
    </Dialog>
  );
}

export default {
  New: NewModelFormDialog,
};
