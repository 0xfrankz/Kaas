import { DialogDescription } from '@radix-ui/react-dialog';
import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import type { HTMLAttributes } from 'react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  useCreateConversationMutation,
  useFilledPromptContext,
} from '@/lib/hooks';
import { extractVariables, interpolate } from '@/lib/prompts';
import { FilledPromptContextProvider } from '@/lib/providers';
import { conversationFormSchema } from '@/lib/schemas';
import { useAppStateStore } from '@/lib/store';
import type { DialogHandler, Prompt, UnsavedConversation } from '@/lib/types';

import PromptForm from './forms/PromptForm';
import { PromptPreviewer } from './PromptPreviewer';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Form, FormControl, FormField, FormItem } from './ui/form';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type UsePromptDialogProps = {
  onConfirm: () => void;
};

const LocalNewConversationForm = forwardRef<
  HTMLFormElement,
  HTMLAttributes<HTMLFormElement>
>((props, ref) => {
  const { prompt } = useFilledPromptContext();
  const promptCtx = Object.fromEntries(
    prompt.variables?.map((v) => [v.label, v.value]) ?? []
  );
  const promptStr = interpolate(prompt.prompt, promptCtx);
  const { models } = useAppStateStore();
  const form = useForm<UnsavedConversation>();
  const createConversationMutation = useCreateConversationMutation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Callbacks
  const onSubmit: SubmitHandler<UnsavedConversation> = (formData) => {
    const validation = conversationFormSchema.safeParse(formData);
    if (validation.success) {
      // createConversationMutation.mutate(validation.data, {
      //   onSuccess: async (conversation) => {
      //     navigate(`/conversations/${conversation.id}`);
      //     return queryClient.invalidateQueries({
      //       queryKey: LIST_CONVERSATIONS_KEY,
      //     });
      //   },
      // });
      console.log(validation.data);
      toast.success('Validated!!!');
    } else {
      toast.warning(
        "Input can't be empty. Type something to start a new conversation."
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props} ref={ref}>
        <div className="flex h-[72px] items-center justify-end">
          <FormField
            control={form.control}
            name="message"
            defaultValue={promptStr}
            render={({ field }) => (
              <FormItem className="ml-4 grow">
                <FormControl>
                  <Input type="hidden" value={promptStr} name={field.name} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="modelId"
            defaultValue={models[0].id}
            render={({ field }) => (
              <FormItem className="w-40">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem value={model.id.toString()} key={model.id}>
                        {model.provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
});

export const PromptUseDialog = forwardRef<
  DialogHandler<Prompt>,
  UsePromptDialogProps
>(({ onConfirm }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const [prompt, setPrompt] = useState<Prompt>();
  const { models } = useAppStateStore();
  const filledPrompt = {
    prompt: prompt?.content ?? '',
    variables: Array.from(new Set(extractVariables(prompt?.content ?? '')))
      .sort()
      .map((label) => ({
        label,
        value: '',
      })),
  };
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('page-prompts:section:use-prompt')}</DialogTitle>
          <DialogDescription>
            {t('page-prompts:message:use-prompt-tips')}
          </DialogDescription>
        </DialogHeader>
        <FilledPromptContextProvider defaultValue={filledPrompt}>
          <div className="flex max-h-[600px] gap-4 overflow-hidden">
            <ScrollArea className="flex-1">
              {prompt.alias}
              <PromptForm.Use
                id="promptForm"
                onSubmit={() => {
                  console.log('onSubmit');
                }}
              />
            </ScrollArea>
            {/* <Separator orientation="vertical" className="mx-2" /> */}
            <div className="flex flex-1 flex-col">
              <ScrollArea className="flex-1 rounded-2xl bg-muted">
                <PromptPreviewer />
              </ScrollArea>
              {/* <div className="flex h-[72px] items-center justify-end">
                <Select
                  onValueChange={() => console.log('model changed')}
                  defaultValue=""
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem value={model.id.toString()} key={model.id}>
                        {model.provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
              <LocalNewConversationForm id="usePromptForm" />
              <div className="flex h-fit items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowDialog(false)}
                >
                  {t('generic:action:cancel')}
                </Button>
                <Button form="usePromptForm" type="submit">
                  <PaperPlaneIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </FilledPromptContextProvider>
      </DialogContent>
    </Dialog>
  ) : null;
});
