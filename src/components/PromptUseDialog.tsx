import { useQueryClient } from '@tanstack/react-query';
import { SendHorizonal } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  LIST_CONVERSATIONS_KEY,
  useCreateConversationMutation,
  useFilledPromptContext,
} from '@/lib/hooks';
import { extractVariables, interpolate } from '@/lib/prompts';
import { FilledPromptContextProvider } from '@/lib/providers';
import { conversationFormSchema } from '@/lib/schemas';
import { useAppStateStore } from '@/lib/store';
import type { DialogHandler, NewConversation, Prompt } from '@/lib/types';
import { getModelAlias } from '@/lib/utils';

import PromptForm from './forms/PromptForm';
import { ModelCreator } from './Models/ModelCreator';
import NumberedBullet from './NumberedBullet';
import { PromptPreviewer } from './PromptPreviewer';
import { ProviderIcon } from './ProviderIcon';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
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
import { Separator } from './ui/separator';

type UsePromptDialogProps = {};

const LocalNewConversationForm = forwardRef<
  HTMLFormElement,
  HTMLAttributes<HTMLFormElement>
>((props, ref) => {
  const { prompt } = useFilledPromptContext();
  const promptCtx = Object.fromEntries(
    prompt.variables?.map((v) => [v.label, v.value]) ?? []
  );
  const promptStr = interpolate(prompt.prompt, promptCtx);
  const { models, getDefaultModel } = useAppStateStore();
  const form = useForm<NewConversation>();
  const createConversationMutation = useCreateConversationMutation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Callbacks
  const onSubmit: SubmitHandler<NewConversation> = (formData) => {
    const validation = conversationFormSchema.safeParse(formData);
    if (validation.success) {
      createConversationMutation.mutate(validation.data, {
        onSuccess: async (conversation) => {
          // mark for auto-continue
          localStorage.setItem('autoContinue', String(conversation.id));
          navigate(`/conversations/${conversation.id}`);
          return queryClient.invalidateQueries({
            queryKey: LIST_CONVERSATIONS_KEY,
          });
        },
      });
    } else {
      toast.warning("Prompt can't be empty.");
    }
  };

  useEffect(() => {
    form.setValue('message', promptStr);
  }, [form, promptStr]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props} ref={ref}>
        <div className="flex items-center justify-end">
          <FormField
            control={form.control}
            name="message"
            // defaultValue={promptStr}
            render={({ field }) => (
              <FormItem className="grow">
                <FormControl>
                  <Input type="hidden" {...field} value={promptStr} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="modelId"
            defaultValue={getDefaultModel()?.id ?? models[0].id}
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
                        <div className="flex gap-2">
                          <ProviderIcon provider={model.provider} />
                          {getModelAlias(model)}
                        </div>
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
>((_, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const { models } = useAppStateStore();
  const [prompt, setPrompt] = useState<Prompt>();
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

  const renderEmptyModels = () => {
    return (
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="mx-auto">
            {t('page-prompts:message:no-model')}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          <ModelCreator forceShowText />
        </div>
      </DialogContent>
    );
  };

  const renderForm = () => {
    return prompt ? (
      <DialogContent className="flex max-h-screen py-6 lg:max-w-3xl">
        <ScrollArea className="grow">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {prompt.alias}
            </DialogTitle>
          </DialogHeader>
          <FilledPromptContextProvider defaultValue={filledPrompt}>
            {/* Template section */}
            <div className="mt-4 flex items-center gap-2">
              <NumberedBullet number={1} />
              <h3 className="text-base">
                {t('page-prompts:message:fill-the-template')}
              </h3>
            </div>
            <div className="mt-4 flex grow flex-col gap-4 overflow-hidden lg:flex-row">
              <ScrollArea className="flex-1 lg:max-h-96">
                <PromptForm.Use id="promptForm" />
              </ScrollArea>
              <ScrollArea className="flex-1 lg:max-h-96">
                <PromptPreviewer />
              </ScrollArea>
            </div>
            <Separator className="my-4" />
            {/* Model section */}
            <div className="mt-4 flex items-center gap-2">
              <NumberedBullet number={2} />
              <h3 className="text-base">
                {t('page-prompts:message:pick-a-model')}
              </h3>
            </div>
            <div className="mt-4 flex">
              <LocalNewConversationForm id="usePromptForm" />
            </div>
            <Separator className="my-4" />
            {/* Actions section */}
            <div className="my-4 flex items-center gap-2">
              <NumberedBullet number={3} />
              <h3 className="text-base">
                {t('page-prompts:message:start-conversation')}
              </h3>
            </div>
            <DialogFooter className="gap-4">
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  // onClick={() => setShowDialog(false)}
                >
                  {t('generic:action:cancel')}
                </Button>
              </DialogClose>
              <Button form="usePromptForm" type="submit">
                <SendHorizonal className="size-4" />
              </Button>
            </DialogFooter>
          </FilledPromptContextProvider>
        </ScrollArea>
      </DialogContent>
    ) : null;
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      {models && models.length > 0 ? renderForm() : renderEmptyModels()}
    </Dialog>
  );
});
