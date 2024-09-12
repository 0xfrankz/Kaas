import { useQueryClient } from '@tanstack/react-query';
import { SendHorizonal } from 'lucide-react';
import { useRef } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  LIST_CONVERSATIONS_KEY,
  useCreateConversationMutation,
} from '@/lib/hooks';
import { conversationFormSchema } from '@/lib/schemas';
import { useAppStateStore } from '@/lib/store';
import type { NewConversation } from '@/lib/types';
import { getModelAlias } from '@/lib/utils';

import { ProviderIcon } from '../ProviderIcon';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { withTextMenu } from '../WithTextMenu';

const InputWithMenu = withTextMenu(Input);

export function NewConversationForm() {
  const { models, getDefaultModel } = useAppStateStore();
  const form = useForm<NewConversation>();
  const inputRef = useRef<HTMLInputElement>(null);
  const createConversationMutation = useCreateConversationMutation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation(['page-conversations']);

  // Callbacks
  const onSubmit: SubmitHandler<NewConversation> = (formData) => {
    const validation = conversationFormSchema.safeParse(formData);
    if (validation.success) {
      createConversationMutation.mutate(validation.data, {
        onSuccess: async (conversation) => {
          localStorage.setItem('autoContinue', String(conversation.id));
          await queryClient.invalidateQueries({
            queryKey: LIST_CONVERSATIONS_KEY,
          });
          navigate(`/conversations/${conversation.id}`);
        },
        onError: (err) => {
          toast.error(
            t('page-conversations:message:create-conversation-error', {
              errorMsg: err.message,
            })
          );
        },
      });
    } else {
      inputRef.current?.focus();
      toast.warning(t('page-conversations:message:input-cant-be-empty'));
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
        {t('page-conversations:label:quick-start')}
      </h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex grow flex-col"
        >
          <div className="mt-6 box-border flex h-fit grow flex-col rounded-2xl border border-input hover:border-input-hover md:h-[72px] md:flex-row md:items-center lg:mx-auto lg:w-full lg:max-w-[720px]">
            <FormField
              control={form.control}
              name="message"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="mx-4 grow">
                  <FormControl>
                    <InputWithMenu
                      placeholder={t('page-conversations:message:ask-anything')}
                      {...field}
                      className="border-0 px-0"
                      ref={inputRef}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="m-4 flex justify-between md:justify-normal md:gap-4">
              <FormField
                control={form.control}
                name="modelId"
                defaultValue={getDefaultModel()?.id ?? models[0].id}
                render={({ field }) => (
                  <FormItem className="w-fit max-w-44">
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
                          <SelectItem
                            value={model.id.toString()}
                            key={model.id}
                          >
                            <div className="flex gap-2">
                              <ProviderIcon provider={model.provider} />
                              {getModelAlias(model)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                <SendHorizonal className="size-4" />
              </Button>
            </div>
          </div>
          <div className="col-span-3 col-start-2">
            <FormMessage />
          </div>
        </form>
      </Form>
    </div>
  );
}
