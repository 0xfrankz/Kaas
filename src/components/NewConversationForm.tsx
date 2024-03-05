import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { LIST_CONVERSATIONS_KEY, useCreateConversation } from '@/lib/hooks';
import { conversationFormSchema } from '@/lib/schemas';
import { useAppStateStore } from '@/lib/store';
import type { UnsavedConversation } from '@/lib/types';

import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useToast } from './ui/use-toast';

export function NewConversationForm() {
  const { models } = useAppStateStore();
  const form = useForm<UnsavedConversation>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createConversationMutation = useCreateConversation();
  const queryClient = useQueryClient();

  // Callbacks
  const onSubmit: SubmitHandler<UnsavedConversation> = (formData) => {
    const validation = conversationFormSchema.safeParse(formData);
    if (validation.success) {
      createConversationMutation.mutate(validation.data, {
        onSuccess: (conversation) => {
          // TODO: redirect to conversation page
          // TODO: store first message to state
          console.log('conversation create:', conversation);
          queryClient.invalidateQueries({ queryKey: LIST_CONVERSATIONS_KEY });
        },
      });
    } else {
      inputRef.current?.focus();
      toast({
        title: "Input can't be empty",
        description: 'Type something to start a new conversation.',
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-semibold tracking-tight">
        Start a new conversation
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mt-6 box-border flex h-[72px] w-[720px] items-center rounded-2xl border border-slate-300 bg-gray-50">
            <FormField
              control={form.control}
              name="message"
              defaultValue=""
              render={({ field }) => (
                <FormItem className="ml-4 grow">
                  <FormControl>
                    <Input
                      placeholder="Ask anything..."
                      {...field}
                      className="border-0 px-0"
                      ref={inputRef}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modelId"
              defaultValue={models[0].id}
              render={({ field }) => (
                <FormItem className="ml-4 w-40">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white shadow-none focus:ring-0">
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mx-4">
              <PaperPlaneIcon className="size-4" />
            </Button>
          </div>
          <div className="col-span-3 col-start-2">
            <FormMessage />
          </div>
        </form>
      </Form>
    </div>
  );
}
