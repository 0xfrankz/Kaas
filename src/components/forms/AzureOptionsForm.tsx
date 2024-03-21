import { zodResolver } from '@hookform/resolvers/zod';
import type { ForwardedRef, HTMLAttributes } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';

import { PROVIDER_AZURE } from '@/lib/constants';
import { azureChatOptionsFormSchema } from '@/lib/schemas';
import type { AzureChatOptions, FormHandler } from '@/lib/types';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';

type AzureOptionsFormInnerProps = Omit<
  HTMLAttributes<HTMLFormElement>,
  'onSubmit'
> & {
  onFormSubmit: (formData: AzureChatOptions) => void;
};

function AzureOptionsFormInner(
  { onFormSubmit, ...props }: AzureOptionsFormInnerProps,
  ref: ForwardedRef<FormHandler>
) {
  const form = useForm<AzureChatOptions>({
    resolver: zodResolver(azureChatOptionsFormSchema),
    defaultValues: {
      provider: PROVIDER_AZURE,
      frequencyPenalty: 0,
      maxTokens: 16,
      n: 1,
      presencePenalty: 0,
      stream: false,
      temperature: 1,
      topP: 1,
      user: '',
    },
  });

  // Hooks
  useImperativeHandle(
    ref,
    () => {
      return {
        reset: () => form.reset(),
      };
    },
    [form]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} {...props}>
        <div className="grid grid-cols-2 gap-4 py-8">
          <FormField
            control={form.control}
            name="frequencyPenalty"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="col-span-2 text-right">
                  Frequency Penalty
                </FormLabel>
                <FormControl>
                  <Input className="col-span-2" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxTokens"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="col-span-2 text-right">
                  Max Tokens
                </FormLabel>
                <FormControl>
                  <Input className="col-span-2" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="n"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="col-span-2 text-right">N</FormLabel>
                <FormControl>
                  <Input className="col-span-2" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="presencePenalty"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="col-span-2 text-right">
                  Presence Penalty
                </FormLabel>
                <FormControl>
                  <Input className="col-span-2" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stream"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="col-span-2 text-right">Stream</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="temperature"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="col-span-2 text-right">
                  Temperature
                </FormLabel>
                <FormControl>
                  <Input className="col-span-2" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="topP"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="col-span-2 text-right">Top P</FormLabel>
                <FormControl>
                  <Input className="col-span-2" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="col-span-2 text-right">User</FormLabel>
                <FormControl>
                  <Input className="col-span-2" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="hidden" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
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
  FormHandler,
  AzureOptionsFormInnerProps
>(AzureOptionsFormInner);
