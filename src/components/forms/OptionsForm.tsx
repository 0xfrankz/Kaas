import { zodResolver } from '@hookform/resolvers/zod';
import type { ForwardedRef, HTMLAttributes } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import type { Control, FieldPath } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  DEFAULT_CONTEXT_LENGTH,
  DEFAULT_MAX_TOKENS,
  SETTING_MODELS_CONTEXT_LENGTH,
  SETTING_MODELS_MAX_TOKENS,
} from '@/lib/constants';
import {
  azureOptionsFormSchema,
  claudeOptionsFormSchema,
  ollamaOptionsFormSchema,
  openAIOptionsFormSchema,
} from '@/lib/schemas';
import { useAppStateStore } from '@/lib/store';
import type {
  AzureOptions,
  ClaudeOptions,
  FormHandler,
  OllamaOptions,
  OpenAIOptions,
  Options,
} from '@/lib/types';

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

type FormProps<T extends Options> = Omit<
  HTMLAttributes<HTMLFormElement>,
  'onSubmit'
> & {
  onSubmit: (formData: T) => void;
  defaultValues: T;
};

type FormFieldProps<T extends Options> = {
  control: Control<T>;
};

// The ContextLengthField component
const ContextLengthField = <T extends Options>({
  control,
}: FormFieldProps<T>) => {
  const ctxLength = useAppStateStore(
    (state) =>
      state.settings[SETTING_MODELS_CONTEXT_LENGTH] ?? DEFAULT_CONTEXT_LENGTH
  );
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={'contextLength' as FieldPath<T>}
      render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
          <FormLabel className="col-span-2 text-right">
            {t('page-conversation:label:context-length')}
          </FormLabel>
          <FormControl>
            <Input
              className="col-span-2"
              {...field}
              value={(field.value ?? '') as string}
              placeholder={ctxLength}
            />
          </FormControl>
          <div className="col-span-4">
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

// The FrequencyPenaltyField component
const FrequencyPenaltyField = <T extends Options>({
  control,
}: FormFieldProps<T>) => {
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={'frequencyPenalty' as FieldPath<T>}
      render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
          <FormLabel className="col-span-2 text-right">
            {t('page-conversation:label:frequency-penalty')}
          </FormLabel>
          <FormControl>
            <Input
              className="col-span-2"
              {...field}
              value={(field.value ?? '') as string}
            />
          </FormControl>
          <div className="col-span-4">
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

// The MaxTokensField component
const MaxTokensField = <T extends Options>({ control }: FormFieldProps<T>) => {
  const maxTokens = useAppStateStore(
    (state) => state.settings[SETTING_MODELS_MAX_TOKENS] ?? DEFAULT_MAX_TOKENS
  );
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={'maxTokens' as FieldPath<T>}
      render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
          <FormLabel className="col-span-2 text-right">
            {t('page-conversation:label:max-tokens')}
          </FormLabel>
          <FormControl>
            <Input
              className="col-span-2"
              {...field}
              value={(field.value ?? '') as string}
              placeholder={maxTokens}
            />
          </FormControl>
          <div className="col-span-4">
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

// The PresencePenaltyField component
const PresencePenaltyField = <T extends Options>({
  control,
}: FormFieldProps<T>) => {
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={'presencePenalty' as FieldPath<T>}
      render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
          <FormLabel className="col-span-2 text-right">
            {t('page-conversation:label:presence-penalty')}
          </FormLabel>
          <FormControl>
            <Input
              className="col-span-2"
              {...field}
              value={(field.value ?? '') as string}
            />
          </FormControl>
          <div className="col-span-4">
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

// The StreamField component
const StreamField = <T extends Options>({ control }: FormFieldProps<T>) => {
  const { t } = useTranslation();
  return (
    <FormField
      control={control}
      name={'stream' as FieldPath<T>}
      render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
          <FormLabel className="col-span-2 text-right">
            {t('page-conversation:label:stream')}
          </FormLabel>
          <FormControl>
            <Switch
              checked={field.value as boolean}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="col-span-4">
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

const AzureOptionsForm = forwardRef<FormHandler, FormProps<AzureOptions>>(
  (
    { onSubmit, defaultValues, ...props }: FormProps<AzureOptions>,
    ref: ForwardedRef<FormHandler>
  ) => {
    const form = useForm<AzureOptions>({
      resolver: zodResolver(azureOptionsFormSchema),
      defaultValues: {
        user: '', // default user to empty to avoid React's Uncontrolled Input warning
        ...defaultValues,
      },
    });
    const { t } = useTranslation();

    // Hooks
    useImperativeHandle(ref, () => {
      return {
        reset: () => form.reset(),
      };
    }, [form]);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
          <div className="grid grid-cols-2 gap-4 py-8">
            <ContextLengthField control={form.control} />
            <FrequencyPenaltyField control={form.control} />
            <MaxTokensField control={form.control} />
            <PresencePenaltyField control={form.control} />
            <StreamField control={form.control} />
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:temperature')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-2" {...field} />
                  </FormControl>
                  <div className="col-span-4">
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
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:top-p')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-2" {...field} />
                  </FormControl>
                  <div className="col-span-4">
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
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:user')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-2" {...field} />
                  </FormControl>
                  <div className="col-span-4">
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
);

const OpenAIOptionsForm = forwardRef<FormHandler, FormProps<OpenAIOptions>>(
  (
    { onSubmit, defaultValues, ...props }: FormProps<OpenAIOptions>,
    ref: ForwardedRef<FormHandler>
  ) => {
    const form = useForm<OpenAIOptions>({
      resolver: zodResolver(openAIOptionsFormSchema),
      defaultValues: {
        ...defaultValues,
      },
    });
    const { t } = useTranslation();

    // Hooks
    useImperativeHandle(ref, () => {
      return {
        reset: () => form.reset(),
      };
    }, [form]);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
          <div className="grid grid-cols-2 gap-4 py-8">
            <ContextLengthField control={form.control} />
            <FrequencyPenaltyField control={form.control} />
            <MaxTokensField control={form.control} />
            <PresencePenaltyField control={form.control} />
            <StreamField control={form.control} />
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:temperature')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-2" {...field} />
                  </FormControl>
                  <div className="col-span-4">
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
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:top-p')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-2" {...field} />
                  </FormControl>
                  <div className="col-span-4">
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
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:user')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="col-span-2"
                      {...field}
                      value={field.value ?? ''}
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
              name="provider"
              render={({ field }) => (
                <FormItem>
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

const ClaudeOptionsForm = forwardRef<FormHandler, FormProps<ClaudeOptions>>(
  (
    { onSubmit, defaultValues, ...props }: FormProps<ClaudeOptions>,
    ref: ForwardedRef<FormHandler>
  ) => {
    const form = useForm<ClaudeOptions>({
      resolver: zodResolver(claudeOptionsFormSchema),
      defaultValues: {
        ...defaultValues,
      },
    });
    const { t } = useTranslation();
    const ctxLength = useAppStateStore(
      (state) =>
        state.settings[SETTING_MODELS_CONTEXT_LENGTH] ?? DEFAULT_CONTEXT_LENGTH
    );

    // Hooks
    useImperativeHandle(ref, () => {
      return {
        reset: () => form.reset(),
      };
    }, [form]);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
          <div className="grid grid-cols-2 gap-4 py-8">
            <ContextLengthField control={form.control} />
            <MaxTokensField control={form.control} />
            <StreamField control={form.control} />
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:temperature')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-2" {...field} />
                  </FormControl>
                  <div className="col-span-4">
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
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:top-p')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-2" {...field} />
                  </FormControl>
                  <div className="col-span-4">
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
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:user')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="col-span-2"
                      {...field}
                      value={field.value ?? ''}
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
              name="provider"
              render={({ field }) => (
                <FormItem>
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

const OllamaOptionsForm = forwardRef<FormHandler, FormProps<OllamaOptions>>(
  (
    { onSubmit, defaultValues, ...props }: FormProps<OllamaOptions>,
    ref: ForwardedRef<FormHandler>
  ) => {
    const form = useForm<OllamaOptions>({
      resolver: zodResolver(ollamaOptionsFormSchema),
      defaultValues,
    });
    const { t } = useTranslation();
    const ctxLength = useAppStateStore(
      (state) =>
        state.settings[SETTING_MODELS_CONTEXT_LENGTH] ?? DEFAULT_CONTEXT_LENGTH
    );

    // Hooks
    useImperativeHandle(ref, () => {
      return {
        reset: () => form.reset(),
      };
    }, [form]);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
          <div className="grid grid-cols-2 gap-4 py-8">
            <ContextLengthField control={form.control} />
            <FormField
              control={form.control}
              name="numCtx"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:num-ctx')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-2" {...field} />
                  </FormControl>
                  <div className="col-span-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numPredict"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:num-predict')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-2" {...field} />
                  </FormControl>
                  <div className="col-span-4">
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <StreamField control={form.control} />
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-2 text-right">
                    {t('page-conversation:label:temperature')}
                  </FormLabel>
                  <FormControl>
                    <Input className="col-span-2" {...field} />
                  </FormControl>
                  <div className="col-span-4">
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
                  <div className="col-span-4">
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
  Azure: AzureOptionsForm,
  OpenAI: OpenAIOptionsForm,
  Claude: ClaudeOptionsForm,
  Ollama: OllamaOptionsForm,
};
