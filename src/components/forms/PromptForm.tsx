import { zodResolver } from '@hookform/resolvers/zod';
import type { ForwardedRef, HTMLAttributes } from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  editPromptFormSchema,
  newPromptFormSchema,
  usePromptFormSchema,
} from '@/lib/schemas';
import type { FilledPrompt, FormHandler, NewPrompt, Prompt } from '@/lib/types';
import { debounce } from '@/lib/utils';

import { PromptVariables } from '../PromptVariables';
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

type UseFormProps = Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  defaultValues: Prompt;
  onSubmit: (prompt: string) => void;
  onFormChange: (prompt: string) => void;
};

const NewPromptForm = forwardRef<FormHandler, NewFormProps>(
  ({ onSubmit, ...props }: NewFormProps, ref: ForwardedRef<FormHandler>) => {
    const [prompt, setPrompt] = useState<string>();
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

    const onChangeDebounded = useMemo(() => {
      return debounce((value: string) => {
        setPrompt(value);
      }, 200);
    }, []);

    const onChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChangeDebounded(e.target.value);
      },
      []
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
                      onChange={(ev) => {
                        field.onChange(ev);
                        onChange(ev);
                      }}
                    />
                  </FormControl>
                  <PromptVariables prompt={prompt} />
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
    const [prompt, setPrompt] = useState<string>();
    const { t } = useTranslation(['generic']);
    const form = useForm<Prompt>({
      resolver: zodResolver(editPromptFormSchema),
      defaultValues,
    });

    const onChangeDebounded = useMemo(() => {
      return debounce((value: string) => {
        setPrompt(value);
      }, 200);
    }, []);

    const onChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChangeDebounded(e.target.value);
      },
      []
    );

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
                      onChange={(ev) => {
                        field.onChange(ev);
                        onChange(ev);
                      }}
                    />
                  </FormControl>
                  <PromptVariables prompt={prompt} />
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

const UsePromptForm = forwardRef<FormHandler, UseFormProps>(
  (
    { onSubmit, onFormChange, defaultValues, ...props }: UseFormProps,
    ref: ForwardedRef<FormHandler>
  ) => {
    const [prompt, setPrompt] = useState<string>();
    const { t } = useTranslation(['generic']);
    const form = useForm<FilledPrompt>({
      resolver: zodResolver(usePromptFormSchema),
      defaultValues: {
        prompt: defaultValues?.content ?? '',
      },
    });

    const onChangeDebounded = useMemo(() => {
      return debounce((value: string) => {
        setPrompt(value);
      }, 200);
    }, []);

    const onChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChangeDebounded(e.target.value);
      },
      []
    );

    useEffect(() => {
      const subscription = form.watch((value, { name, type }) =>
        console.log(value, name, type)
      );
      return () => subscription.unsubscribe();
    }, [form.watch]);

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
          <div className="flex flex-col gap-4 py-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormControl>
                    <Textarea
                      className="col-span-4 rounded-md py-1"
                      rows={10}
                      {...field}
                      onChange={(ev) => {
                        field.onChange(ev);
                        onChange(ev);
                      }}
                    />
                  </FormControl>
                  <PromptVariables prompt={prompt} />
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
  Use: UsePromptForm,
};
