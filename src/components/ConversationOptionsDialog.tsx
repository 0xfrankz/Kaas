import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { useRef, useState } from 'react';

import { useGetOptionsQuery, useUpdateOptionsMutation } from '@/lib/hooks';
import type { AzureChatOptions, Conversation } from '@/lib/types';

import { AzureOptionsForm } from './forms/AzureOptionsForm';
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
import { useToast } from './ui/use-toast';

type Props = {
  className?: string;
  conversation: Conversation;
};

export function ConversationOptionsDialog({ className, conversation }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const updateOptionsMutation = useUpdateOptionsMutation();
  const getOptionsQuery = useGetOptionsQuery(conversation.id);
  const { toast } = useToast();

  // TODO: use getOptionsQuery to get conversation options

  const onFormSubmit = (formData: AzureChatOptions) => {
    updateOptionsMutation.mutate(
      {
        conversationId: conversation.id,
        options: formData,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Options of this conversation has been updated',
          });
        },
        onError: (e) => {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: e.message,
          });
        },
        onSettled: () => {
          setOpen(false);
          formRef.current?.reset();
        },
      }
    );
  };

  return (
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
            Altering the options can yield unpredictable behaviors and even
            errors. Make sure you know what you are changing.
          </DialogDescription>
        </DialogHeader>
        <AzureOptionsForm
          id="optionsForm"
          ref={formRef}
          onFormSubmit={onFormSubmit}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button form="optionsForm">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
