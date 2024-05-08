import { zodResolver } from '@hookform/resolvers/zod';
import type { HTMLAttributes } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  newAzureModelFormSchema,
  newOpenAIModelFormSchema,
} from '@/lib/schemas';
import type {
  Model,
  ModelFormHandler,
  NewAzureModel,
  NewModel,
  NewOpenAIModel,
} from '@/lib/types';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

type FormProps<T extends NewModel | Model> = Omit<
  HTMLAttributes<HTMLFormElement>,
  'onSubmit'
> & {
  model: T;
  onSubmit: (model: T) => void;
};

const NewAzureModelForm = forwardRef<
  ModelFormHandler,
  FormProps<NewAzureModel>
>(({ model, onSubmit, ...props }, ref) => {
  const form = useForm<NewAzureModel>({
    resolver: zodResolver(newAzureModelFormSchema),
    defaultValues: model,
  });
  const { t } = useTranslation(['generic']);

  useImperativeHandle(ref, () => ({
    reset: () => {
      form.reset();
    },
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <div className="grid gap-4 py-8">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">API Key</FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                  <FormDescription>
                    This is the key for your Azure API.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endpoint"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">Endpoint</FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                  <FormDescription>
                    This is the endpoint of your Azure API.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apiVersion"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">API Version</FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                  <FormDescription>
                    This is the version of your Azure API.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deploymentId"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">Deployment ID</FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                  <FormDescription>
                    This is the deployment name of your Azure API.
                  </FormDescription>
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
                  <Input
                    type="hidden"
                    value={model.provider}
                    name={field.name}
                  />
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
});

const NewOpenAIModelForm = forwardRef<
  ModelFormHandler,
  FormProps<NewOpenAIModel>
>(({ model, onSubmit, ...props }, ref) => {
  const form = useForm<NewOpenAIModel>({
    resolver: zodResolver(newOpenAIModelFormSchema),
    defaultValues: model,
  });
  const { t } = useTranslation(['generic']);

  useImperativeHandle(ref, () => ({
    reset: () => {
      form.reset();
    },
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <div className="grid gap-4 py-8">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">API Key</FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                  <FormDescription>
                    This is the key for your OpenAI API.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">Model</FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                  <FormDescription>
                    This is the model of your OpenAI API.
                  </FormDescription>
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
                  <Input
                    type="hidden"
                    value={model.provider}
                    name={field.name}
                  />
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
});

export default {
  Azure: {
    New: NewAzureModelForm,
  },
  OpenAI: {
    New: NewOpenAIModelForm,
  },
};
