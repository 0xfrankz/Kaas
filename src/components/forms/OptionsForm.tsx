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

import { InputWithMenu } from '../InputWithMenu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
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
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
};

// OptionsForm's input component
const InputField = <T extends Options>({
  control,
  name,
  label,
  placeholder,
}: FormFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
          <FormLabel className="col-span-1 text-right sm:col-span-2">
            {label}
          </FormLabel>
          <FormControl>
            <InputWithMenu
              className="col-span-3 sm:col-span-2"
              {...field}
              value={(field.value ?? '') as string}
              placeholder={placeholder}
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

// OptionsForm's hidden input component
const HiddenInputField = <T extends Options>({
  control,
  name,
}: Omit<FormFieldProps<T>, 'label' | 'placeholder'>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <InputWithMenu
              type="hidden"
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

// The SwitchField component
const SwitchField = <T extends Options>({
  control,
  name,
  label,
}: Omit<FormFieldProps<T>, 'placeholder'>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
          <FormLabel className="col-span-1 text-right sm:col-span-2">
            {label}
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
    const [ctxLength, maxTokens] = useAppStateStore((state) => [
      state.settings[SETTING_MODELS_CONTEXT_LENGTH] ?? DEFAULT_CONTEXT_LENGTH,
      state.settings[SETTING_MODELS_MAX_TOKENS] ?? DEFAULT_MAX_TOKENS,
    ]);
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
          <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2">
            <InputField
              control={form.control}
              name="contextLength"
              label={t('page-conversation:label:context-length')}
              placeholder={ctxLength}
            />
            <InputField
              control={form.control}
              name="frequencyPenalty"
              label={t('page-conversation:label:frequency-penalty')}
            />
            <InputField
              control={form.control}
              name="maxTokens"
              label={t('page-conversation:label:max-tokens')}
              placeholder={maxTokens}
            />
            <InputField
              control={form.control}
              name="presencePenalty"
              label={t('page-conversation:label:presence-penalty')}
            />
            <SwitchField
              control={form.control}
              name="stream"
              label={t('page-conversation:label:stream')}
            />
            <SwitchField
              control={form.control}
              name="showReasoning"
              label={t('page-conversation:label:show-reasoning')}
            />
            <InputField
              control={form.control}
              name="temperature"
              label={t('page-conversation:label:temperature')}
            />
            <InputField
              control={form.control}
              name="topP"
              label={t('page-conversation:label:top-p')}
            />
            <InputField
              control={form.control}
              name="user"
              label={t('page-conversation:label:user')}
            />
            <HiddenInputField control={form.control} name="provider" />
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
    const [ctxLength, maxTokens] = useAppStateStore((state) => [
      state.settings[SETTING_MODELS_CONTEXT_LENGTH] ?? DEFAULT_CONTEXT_LENGTH,
      state.settings[SETTING_MODELS_MAX_TOKENS] ?? DEFAULT_MAX_TOKENS,
    ]);
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
          <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2">
            <InputField
              control={form.control}
              name="contextLength"
              label={t('page-conversation:label:context-length')}
              placeholder={ctxLength}
            />
            <InputField
              control={form.control}
              name="frequencyPenalty"
              label={t('page-conversation:label:frequency-penalty')}
            />
            <InputField
              control={form.control}
              name="maxTokens"
              label={t('page-conversation:label:max-tokens')}
              placeholder={maxTokens}
            />
            <InputField
              control={form.control}
              name="presencePenalty"
              label={t('page-conversation:label:presence-penalty')}
            />
            <SwitchField
              control={form.control}
              name="stream"
              label={t('page-conversation:label:stream')}
            />
            <SwitchField
              control={form.control}
              name="showReasoning"
              label={t('page-conversation:label:show-reasoning')}
            />
            <InputField
              control={form.control}
              name="temperature"
              label={t('page-conversation:label:temperature')}
            />
            <InputField
              control={form.control}
              name="topP"
              label={t('page-conversation:label:top-p')}
            />
            <InputField
              control={form.control}
              name="user"
              label={t('page-conversation:label:user')}
            />
            <HiddenInputField control={form.control} name="provider" />
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
    const [ctxLength, maxTokens] = useAppStateStore((state) => [
      state.settings[SETTING_MODELS_CONTEXT_LENGTH] ?? DEFAULT_CONTEXT_LENGTH,
      state.settings[SETTING_MODELS_MAX_TOKENS] ?? DEFAULT_MAX_TOKENS,
    ]);
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
          <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2">
            <InputField
              control={form.control}
              name="contextLength"
              label={t('page-conversation:label:context-length')}
              placeholder={ctxLength}
            />
            <InputField
              control={form.control}
              name="maxTokens"
              label={t('page-conversation:label:max-tokens')}
              placeholder={maxTokens}
            />
            <SwitchField
              control={form.control}
              name="stream"
              label={t('page-conversation:label:stream')}
            />
            <SwitchField
              control={form.control}
              name="showReasoning"
              label={t('page-conversation:label:show-reasoning')}
            />
            <InputField
              control={form.control}
              name="temperature"
              label={t('page-conversation:label:temperature')}
            />
            <InputField
              control={form.control}
              name="topP"
              label={t('page-conversation:label:top-p')}
            />
            <InputField
              control={form.control}
              name="user"
              label={t('page-conversation:label:user')}
            />
            <HiddenInputField control={form.control} name="provider" />
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
    const ctxLength = useAppStateStore(
      (state) =>
        state.settings[SETTING_MODELS_CONTEXT_LENGTH] ?? DEFAULT_CONTEXT_LENGTH
    );
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
          <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2">
            <InputField
              control={form.control}
              name="contextLength"
              label={t('page-conversation:label:context-length')}
              placeholder={ctxLength}
            />
            <InputField
              control={form.control}
              name="numCtx"
              label={t('page-conversation:label:num-ctx')}
            />
            <InputField
              control={form.control}
              name="numPredict"
              label={t('page-conversation:label:num-predict')}
            />
            <SwitchField
              control={form.control}
              name="stream"
              label={t('page-conversation:label:stream')}
            />
            <SwitchField
              control={form.control}
              name="showReasoning"
              label={t('page-conversation:label:show-reasoning')}
            />
            <InputField
              control={form.control}
              name="temperature"
              label={t('page-conversation:label:temperature')}
            />
            <InputField
              control={form.control}
              name="topP"
              label={t('page-conversation:label:top-p')}
            />
            <HiddenInputField control={form.control} name="provider" />
          </div>
        </form>
      </Form>
    );
  }
);

const DeepseekOptionsForm = forwardRef<FormHandler, FormProps<OpenAIOptions>>(
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
    const [ctxLength, maxTokens] = useAppStateStore((state) => [
      state.settings[SETTING_MODELS_CONTEXT_LENGTH] ?? DEFAULT_CONTEXT_LENGTH,
      state.settings[SETTING_MODELS_MAX_TOKENS] ?? DEFAULT_MAX_TOKENS,
    ]);
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
          <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2">
            <InputField
              control={form.control}
              name="contextLength"
              label={t('page-conversation:label:context-length')}
              placeholder={ctxLength}
            />
            <InputField
              control={form.control}
              name="frequencyPenalty"
              label={t('page-conversation:label:frequency-penalty')}
            />
            <InputField
              control={form.control}
              name="maxTokens"
              label={t('page-conversation:label:max-tokens')}
              placeholder={maxTokens}
            />
            <InputField
              control={form.control}
              name="presencePenalty"
              label={t('page-conversation:label:presence-penalty')}
            />
            <SwitchField
              control={form.control}
              name="stream"
              label={t('page-conversation:label:stream')}
            />
            <SwitchField
              control={form.control}
              name="showReasoning"
              label={t('page-conversation:label:show-reasoning')}
            />
            <InputField
              control={form.control}
              name="temperature"
              label={t('page-conversation:label:temperature')}
            />
            <InputField
              control={form.control}
              name="topP"
              label={t('page-conversation:label:top-p')}
            />
            <HiddenInputField control={form.control} name="provider" />
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
  Deepseek: DeepseekOptionsForm,
};
