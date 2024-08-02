import { zodResolver } from '@hookform/resolvers/zod';
import type { HTMLAttributes } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  PROVIDER_AZURE,
  PROVIDER_CLAUDE,
  PROVIDER_OLLAMA,
  PROVIDER_OPENAI,
} from '@/lib/constants';
import {
  editAzureModelFormSchema,
  editOpenAIModelFormSchema,
  newAzureModelFormSchema,
  newClaudeModelFormSchema,
  newOllamaModelFormSchema,
  newOpenAIModelFormSchema,
} from '@/lib/schemas';
import type {
  AzureModel,
  Model,
  ModelFormHandler,
  NewAzureModel,
  NewClaudeModel,
  NewModel,
  NewOllamaModel,
  NewOpenAIModel,
  OpenAIModel,
  RawOllamaConfig,
  RawOpenAIConfig,
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
import { RemoteModelsSelector } from './RemoteModelsSelector';

type NewFormProps = Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  onSubmit: (model: NewModel) => void;
};

type EditFormProps = Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  model: Model;
  onSubmit: (model: Model) => void;
};

type GenericFormProps<T extends NewModel | Model> = Omit<
  HTMLAttributes<HTMLFormElement>,
  'onSubmit'
> & {
  form: UseFormReturn<T, any, undefined>;
  onSubmit: (model: T) => void;
  loadModelsOnInit?: boolean;
};

const GenericAzureModelForm = ({
  form,
  onSubmit,
  ...props
}: GenericFormProps<NewModel | Model>) => {
  const { t } = useTranslation(['page-models']);
  const isEdit = !!form.getValues('id');
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <div className="grid gap-4 py-8">
          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">
                  {t('page-models:label:alias')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:alias-tips')}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">
                  {t('page-models:label:api-key')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:api-key-tips')}
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
                <FormLabel className="text-right">
                  {t('page-models:label:endpoint')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:endpoint-tips-azure')}
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
                <FormLabel className="text-right">
                  {t('page-models:label:api-version')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:api-version-tips')}
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
                <FormLabel className="text-right">
                  {t('page-models:label:deployment-id')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:deployment-id-tips')}
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
                  <Input type="hidden" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          {isEdit ? (
            <FormField
              control={form.control}
              name="id"
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
          ) : null}
        </div>
      </form>
    </Form>
  );
};

const GenericOpenAIModelForm = ({
  form,
  onSubmit,
  loadModelsOnInit,
  ...props
}: GenericFormProps<NewModel | Model>) => {
  const { t } = useTranslation(['page-models']);
  const isEdit = !!form.getValues('id');
  const apiKey = useWatch({ name: 'apiKey', control: form.control });
  const config: RawOpenAIConfig = {
    provider: PROVIDER_OPENAI,
    apiKey,
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <div className="grid gap-4 py-8">
          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">
                  {t('page-models:label:alias')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:alias-tips')}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">
                  {t('page-models:label:api-key')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:api-key-tips')}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
            <FormField
              control={form.control}
              name="model"
              render={() => (
                <FormLabel className="text-right">
                  {t('page-models:label:model')}
                </FormLabel>
              )}
            />
            <div className="col-span-3 col-start-2">
              <RemoteModelsSelector
                config={config}
                enabledByDefault={!!loadModelsOnInit}
              />
            </div>
            <div className="col-span-3 col-start-2">
              <FormField
                control={form.control}
                name="model"
                render={() => <FormMessage />}
              />
              <FormDescription>
                {t('page-models:message:model-tips')}
              </FormDescription>
            </div>
          </div>
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
          {isEdit ? (
            <FormField
              control={form.control}
              name="id"
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
          ) : null}
        </div>
      </form>
    </Form>
  );
};

const GenericClaudeModelForm = ({
  form,
  onSubmit,
  ...props
}: GenericFormProps<NewModel | Model>) => {
  const { t } = useTranslation(['page-models']);
  const isEdit = !!form.getValues('id');
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <div className="grid gap-4 py-8">
          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">
                  {t('page-models:label:alias')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:alias-tips')}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">
                  {t('page-models:label:api-key')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:api-key-tips')}
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
                <FormLabel className="text-right">
                  {t('page-models:label:model')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:model-tips')}
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
                <FormLabel className="text-right">
                  {t('page-models:label:api-version')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:claude-api-version-tips')}
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
                  <Input type="hidden" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          {isEdit ? (
            <FormField
              control={form.control}
              name="id"
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
          ) : null}
        </div>
      </form>
    </Form>
  );
};

const GenericOllamaModelForm = ({
  form,
  onSubmit,
  loadModelsOnInit,
  ...props
}: GenericFormProps<NewModel | Model>) => {
  const { t } = useTranslation(['page-models']);
  const isEdit = !!form.getValues('id');
  const endpoint = useWatch({ name: 'endpoint', control: form.control });
  const config: RawOllamaConfig = {
    provider: PROVIDER_OLLAMA,
    endpoint,
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <div className="grid gap-4 py-8">
          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                <FormLabel className="text-right">
                  {t('page-models:label:alias')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-start-2 col-end-4">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:alias-tips')}
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
                <FormLabel className="text-right">
                  {t('page-models:label:endpoint')}
                </FormLabel>
                <FormControl>
                  <Input className="col-span-3" {...field} />
                </FormControl>
                <div className="col-span-3 col-start-2">
                  <FormMessage />
                  <FormDescription>
                    {t('page-models:message:endpoint-tips-azure')}
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
            <FormField
              control={form.control}
              name="model"
              render={() => (
                <FormLabel className="text-right">
                  {t('page-models:label:model')}
                </FormLabel>
              )}
            />
            <div className="col-span-3 col-start-2">
              <RemoteModelsSelector
                config={config}
                enabledByDefault={!!loadModelsOnInit}
              />
            </div>
            <div className="col-span-3 col-start-2">
              <FormField
                control={form.control}
                name="model"
                render={() => <FormMessage />}
              />
              <FormDescription>
                {t('page-models:message:model-tips')}
              </FormDescription>
            </div>
          </div>
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
          {isEdit ? (
            <FormField
              control={form.control}
              name="id"
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
          ) : null}
        </div>
      </form>
    </Form>
  );
};

const NewAzureModelForm = forwardRef<ModelFormHandler, NewFormProps>(
  ({ onSubmit, ...props }, ref) => {
    const form: UseFormReturn<NewAzureModel, unknown, undefined> =
      useForm<NewAzureModel>({
        resolver: zodResolver(newAzureModelFormSchema),
        defaultValues: {
          provider: PROVIDER_AZURE,
          alias: '',
          apiKey: '',
          endpoint: '',
          apiVersion: '',
          deploymentId: '',
        },
      });

    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset();
      },
    }));

    return (
      <GenericAzureModelForm
        form={form as UseFormReturn<NewModel, unknown, undefined>}
        onSubmit={onSubmit}
        {...props}
      />
    );
  }
);

const EditAzureModelForm = forwardRef<ModelFormHandler, EditFormProps>(
  ({ model, onSubmit, ...props }, ref) => {
    const form = useForm<AzureModel>({
      resolver: zodResolver(editAzureModelFormSchema),
      defaultValues: model as AzureModel,
    });

    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset();
      },
    }));

    return (
      <GenericAzureModelForm
        form={form as UseFormReturn<NewModel | Model, unknown, undefined>}
        onSubmit={onSubmit as (model: NewModel | Model) => void}
        {...props}
      />
    );
  }
);

const NewOpenAIModelForm = forwardRef<ModelFormHandler, NewFormProps>(
  ({ onSubmit, ...props }, ref) => {
    const form = useForm<NewOpenAIModel>({
      resolver: zodResolver(newOpenAIModelFormSchema),
      defaultValues: {
        provider: PROVIDER_OPENAI,
        alias: '',
        apiKey: '',
        model: '',
      },
    });

    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset();
      },
    }));

    return (
      <GenericOpenAIModelForm
        form={form as UseFormReturn<NewModel, any, undefined>}
        onSubmit={onSubmit}
        {...props}
      />
    );
  }
);

const EditOpenAIModelForm = forwardRef<ModelFormHandler, EditFormProps>(
  ({ model, onSubmit, ...props }, ref) => {
    const form = useForm<OpenAIModel>({
      resolver: zodResolver(editOpenAIModelFormSchema),
      defaultValues: model as OpenAIModel,
    });

    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset();
      },
    }));

    return (
      <GenericOpenAIModelForm
        form={form as UseFormReturn<NewModel | Model, any, undefined>}
        onSubmit={onSubmit as (model: NewModel | Model) => void}
        loadModelsOnInit
        {...props}
      />
    );
  }
);

const NewClaudeModelForm = forwardRef<ModelFormHandler, NewFormProps>(
  ({ onSubmit, ...props }, ref) => {
    const form = useForm<NewClaudeModel>({
      resolver: zodResolver(newClaudeModelFormSchema),
      defaultValues: {
        provider: PROVIDER_CLAUDE,
        alias: '',
        apiKey: '',
        model: '',
        apiVersion: '',
      },
    });

    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset();
      },
    }));

    return (
      <GenericClaudeModelForm
        form={form as UseFormReturn<NewModel, any, undefined>}
        onSubmit={onSubmit}
        {...props}
      />
    );
  }
);

const NewOllamaModelForm = forwardRef<ModelFormHandler, NewFormProps>(
  ({ onSubmit, ...props }, ref) => {
    const form = useForm<NewOllamaModel>({
      resolver: zodResolver(newOllamaModelFormSchema),
      defaultValues: {
        provider: PROVIDER_OLLAMA,
        alias: '',
        endpoint: '',
        model: '',
      },
    });

    useImperativeHandle(ref, () => ({
      reset: () => {
        form.reset();
      },
    }));

    return (
      <GenericOllamaModelForm
        form={form as UseFormReturn<NewModel, any, undefined>}
        onSubmit={onSubmit}
        {...props}
      />
    );
  }
);

export default {
  Azure: {
    New: NewAzureModelForm,
    Edit: EditAzureModelForm,
  },
  OpenAI: {
    New: NewOpenAIModelForm,
    Edit: EditOpenAIModelForm,
  },
  Claude: {
    New: NewClaudeModelForm,
  },
  Ollama: {
    New: NewOllamaModelForm,
  },
};
