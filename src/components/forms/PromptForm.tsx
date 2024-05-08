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
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useFilledPromptContext } from '@/lib/hooks';
import { extractVariables } from '@/lib/prompts';
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

const UsePromptForm = forwardRef<FormHandler, HTMLAttributes<HTMLFormElement>>(
  (
    { ...props }: HTMLAttributes<HTMLFormElement>,
    ref: ForwardedRef<FormHandler>
  ) => {
    const { prompt: filledPrompt, setPrompt: setFilledPrompt } =
      useFilledPromptContext();
    const form = useForm<FilledPrompt>({
      resolver: zodResolver(usePromptFormSchema),
      defaultValues: filledPrompt,
    });
    const formData = useWatch({
      control: form.control,
      defaultValue: filledPrompt,
    });
    const { fields, insert, remove } = useFieldArray({
      control: form.control,
      name: 'variables',
    });
    const prompt = form.watch('prompt');

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

    useEffect(() => {
      const newVars = new Set(extractVariables(prompt));
      const oldVars = fields.map((f) => f.label).sort();
      // remove first
      const toRemove: number[] = [];
      oldVars.forEach((ov, i) => {
        if (!newVars.has(ov)) {
          toRemove.push(i);
        }
      });
      remove(toRemove);
      // then add
      newVars.forEach((nv) => {
        let insertPos = 0;
        let matchPos = -1;
        for (let i = 0; i < oldVars.length; i += 1) {
          if (oldVars[i] === nv) {
            // if match exists, break and do nothing
            matchPos = i;
            break;
          } else if (oldVars[i] > nv) {
            // elif next value is greater, insert at this position
            insertPos = i;
            break;
          } else {
            // else move cursor forward
            insertPos += 1;
          }
        }

        if (matchPos === -1) {
          insert(insertPos, { label: nv, value: '' }, { shouldFocus: false });
        }
      });
    }, [prompt]);

    useEffect(() => {
      const data = {
        prompt: formData.prompt ?? '',
        variables:
          formData.variables?.map((v) => ({
            label: v.label ?? '',
            value: v.value ?? '',
          })) ?? [],
      };
      setFilledPrompt(data);
    }, [formData]);

    const renderVariables = () => {
      return fields.map((item, index) => {
        return (
          <Controller
            key={item.id}
            control={form.control}
            name={`variables.${index}.value`}
            render={({ field }) => {
              return (
                <div className="col-span-4">
                  <label htmlFor={field.name}>{item.label}</label>
                  <Input {...field} id={field.name} className="mt-1" />
                </div>
              );
            }}
          />
        );
      });
    };

    return (
      <Form {...form}>
        <form {...props}>
          <div className="flex flex-col gap-4 py-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormControl>
                    <Textarea
                      className="col-span-4 rounded-md py-1"
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
            {renderVariables()}
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
