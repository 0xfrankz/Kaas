import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { PROVIDER_AZURE } from '@/lib/constants';
import { AppError, ERROR_TYPE_APP_STATE } from '@/lib/error';
import { useGetOptionsQuery, useUpdateOptionsMutation } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import type {
  AzureOptions,
  Conversation,
  OpenAIOptions,
  Options,
} from '@/lib/types';

import OptionsForm from './forms/OptionsForm';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

type Props = {
  className?: string;
  conversation: Conversation;
};

export function ConversationOptionsDialog({ className, conversation }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const updateOptionsMutation = useUpdateOptionsMutation();
  const {
    key: queryKey,
    query: { data: options, isSuccess, isError, error },
  } = useGetOptionsQuery(conversation.id);
  const queryClient = useQueryClient();
  const model = useAppStateStore((state) =>
    state.models.find((m) => m.id === conversation.modelId)
  );

  if (!model) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      'Unknown',
      'Cannot find model for this conversation!'
    );
  }

  if (isError && error) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      error.message,
      'Failed to load conversation options!'
    );
  }

  // Callbacks
  const onFormSubmit = (formData: Options) => {
    console.log('onFormSubmit', formData);
    updateOptionsMutation.mutate(
      {
        conversationId: conversation.id,
        options: formData,
      },
      {
        onSuccess: async () => {
          toast.success('Options are successfully saved');
          return queryClient.invalidateQueries({ queryKey });
        },
        onError: (e) => {
          toast.error(e.message);
        },
        onSettled: () => {
          setOpen(false);
          formRef.current?.reset();
        },
      }
    );
  };

  const renderForm = () => {
    switch (model.provider) {
      case PROVIDER_AZURE:
        return (
          <OptionsForm.Azure
            id="optionsForm"
            ref={formRef}
            onSubmit={onFormSubmit}
            defaultValues={options as AzureOptions}
          />
        );
      default:
        return (
          <OptionsForm.OpenAI
            id="optionsForm"
            ref={formRef}
            onSubmit={onFormSubmit}
            defaultValues={options as OpenAIOptions}
          />
        );
    }
  };

  return isSuccess && options ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <MixerHorizontalIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Change options of this conversation</DialogTitle>
          <DialogDescription>
            Altering the options can cause unpredictable behaviors and even
            errors. Make sure you know what you are changing.
          </DialogDescription>
        </DialogHeader>
        {renderForm()}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button form="optionsForm">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;
}
