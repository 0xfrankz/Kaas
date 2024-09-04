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

import { InputWithMenu } from '../InputWithMenu';
import { PromptVariables } from '../PromptVariables';
import { TextAreaWithMenu } from '../TextareaWithMenu';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';

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
    useImperativeHandle(ref, () => {
      return {
        reset: () => form.reset(),
      };
    }, [form]);

    const onChangeDebounded = useMemo(() => {
      return debounce((value: string) => {
        setPrompt(value);
      }, 200);
    }, []);

    const onChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChangeDebounded(e.target.value);
      },
      [onChangeDebounded]
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
                  <FormLabel className="col-span-4 text-left sm:col-span-1 sm:text-right">
                    {t('generic:label:prompt')}
                  </FormLabel>
                  <FormControl>
                    <TextAreaWithMenu
                      className="col-span-4 h-52 rounded-md py-1 sm:col-span-3"
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
                  <FormLabel className="col-span-4 text-left sm:col-span-1 sm:text-right">
                    {t('generic:label:alias')}
                  </FormLabel>
                  <FormControl>
                    <InputWithMenu
                      className="col-span-4 rounded-md py-1 sm:col-span-3"
                      {...field}
                    />
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
      [onChangeDebounded]
    );

    // Hooks
    useImperativeHandle(ref, () => {
      return {
        reset: () => form.reset(),
      };
    }, [form]);

    useEffect(() => {
      // initialize prompt
      setPrompt(form.getValues('content'));
    }, [form]);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
          <div className="flex flex-col gap-4 py-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                  <FormLabel className="col-span-4 text-left sm:col-span-1 sm:text-right">
                    {t('generic:label:prompt')}
                  </FormLabel>
                  <FormControl>
                    <TextAreaWithMenu
                      className="col-span-4 h-52 rounded-md py-1 sm:col-span-3"
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
                  <FormLabel className="col-span-4 text-left sm:col-span-1 sm:text-right">
                    {t('generic:label:alias')}
                  </FormLabel>
                  <FormControl>
                    <InputWithMenu
                      className="col-span-4 rounded-md py-1 sm:col-span-3"
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
    const [editing, setEditing] = useState<boolean>(false);
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
    const { t } = useTranslation(['page-prompts']);

    // Hooks
    useImperativeHandle(ref, () => {
      return {
        reset: () => form.reset(),
      };
    }, [form]);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }, [formData, setFilledPrompt]);

    const renderVariables = () => {
      return (
        <div className="flex flex-col gap-1">
          <h4 className="mt-2 text-sm font-semibold">
            {t('page-prompts:section:variables')}
          </h4>
          {fields.map((item, index) => {
            return (
              <Controller
                key={item.id}
                control={form.control}
                name={`variables.${index}.value`}
                render={({ field }) => {
                  return (
                    <div>
                      <label
                        htmlFor={field.name}
                        className="text-sm text-muted-foreground"
                      >
                        {item.label}
                      </label>
                      <InputWithMenu
                        {...field}
                        id={field.name}
                        className="mt-1"
                      />
                    </div>
                  );
                }}
              />
            );
          })}
        </div>
      );
    };

    return (
      <Form {...form}>
        <form {...props}>
          <div className="flex flex-col gap-2">
            {editing ? (
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                    <FormControl>
                      <TextAreaWithMenu
                        className="col-span-4 h-52 rounded-md py-1"
                        {...field}
                      />
                    </FormControl>
                    <div className="col-span-4">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            ) : (
              <div className="flex items-center justify-between gap-2 rounded-md border border-input bg-accent p-2 hover:border-input-hover">
                <span className="max-h-6 max-w-60 overflow-hidden truncate text-sm">
                  {prompt}
                </span>
                <Button
                  variant="secondary"
                  className="text-sm"
                  onClick={() => setEditing(true)}
                >
                  {t('generic:action:edit')}
                </Button>
              </div>
            )}
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
