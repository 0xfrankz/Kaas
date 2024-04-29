import { zodResolver } from '@hookform/resolvers/zod';
import type { ForwardedRef, HTMLAttributes } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { editPromptFormSchema, newPromptFormSchema } from '@/lib/schemas';
import type { FormHandler, NewPrompt, Prompt } from '@/lib/types';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

type NewFormProps = Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  onSubmit: (newPrompt: NewPrompt) => void;
};

type EditFormProps = Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  defaultValues: Prompt;
  onSubmit: (prompt: Prompt) => void;
};

const NewPromptForm = forwardRef<FormHandler, NewFormProps>(
  ({ onSubmit, ...props }: NewFormProps, ref: ForwardedRef<FormHandler>) => {
    const { t } = useTranslation(['generic']);
    const form = useForm<NewPrompt>({
      resolver: zodResolver(newPromptFormSchema),
      defaultValues: {
        alias: '',
        content: '',
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
        <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
          <div className="flex flex-col gap-4 py-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-1 text-right">
                    {t('generic:label:prompt')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="col-span-3 rounded-md py-1"
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <div className="col-span-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-1 text-right">
                    {t('generic:label:alias')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-3" {...field} />
                  </FormControl>
                  <div className="col-span-4">
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
);

const EditPromptForm = forwardRef<FormHandler, EditFormProps>(
  (
    { onSubmit, defaultValues, ...props }: EditFormProps,
    ref: ForwardedRef<FormHandler>
  ) => {
    const { t } = useTranslation(['generic']);
    const form = useForm<Prompt>({
      resolver: zodResolver(editPromptFormSchema),
      defaultValues,
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
        <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
          <div className="flex flex-col gap-4 py-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-1 text-right">
                    {t('generic:label:prompt')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="col-span-3 rounded-md py-1"
                      rows={10}
                      {...field}
                    />
                  </FormControl>
                  <div className="col-span-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-1 text-right">
                    {t('generic:label:alias')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-3" {...field} />
                  </FormControl>
                  <div className="col-span-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                  <div className="col-span-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="createdAt"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                  <div className="col-span-4">
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
);

export default {
  New: NewPromptForm,
  Edit: EditPromptForm,
};
