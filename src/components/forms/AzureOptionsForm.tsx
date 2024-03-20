import { zodResolver } from '@hookform/resolvers/zod';
import type { ForwardedRef, HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';

import { azureChatOptionsFormSchema } from '@/lib/schemas';
import type { AzureChatOptions } from '@/lib/types';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

type AzureOptionsFormInnerProps = {
  onFormSubmit: (formData: AzureChatOptions) => void;
};

function AzureOptionsFormInner(
  {
    onFormSubmit,
    ...props
  }: HTMLAttributes<HTMLFormElement> & AzureOptionsFormInnerProps,
  ref: ForwardedRef<HTMLFormElement>
) {
  const form = useForm<AzureChatOptions>({
    resolver: zodResolver(azureChatOptionsFormSchema),
    defaultValues: {
      maxTokens: 16,
      temperature: 1,
      user: '',
      stream: false,
      logprobs: undefined,
      suffix: undefined,
      echo: false,
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} ref={ref} {...props}>
        <div className="grid gap-4 py-8">
          <FormField
            control={form.control}
            name="maxTokens"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">Max Tokens</FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}

export const AzureOptionsForm = forwardRef<
  HTMLFormElement,
  HTMLAttributes<HTMLFormElement> & AzureOptionsFormInnerProps
>(AzureOptionsFormInner);
