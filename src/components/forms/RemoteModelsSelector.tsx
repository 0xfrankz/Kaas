import { useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  PROVIDER_CLAUDE,
  PROVIDER_DEEPSEEK,
  PROVIDER_GOOGLE,
  PROVIDER_OLLAMA,
  PROVIDER_OPENAI,
  PROVIDER_OPENROUTER,
  PROVIDER_XAI,
} from '@/lib/constants';
import { LIST_REMOTE_MODELS_KEY, useListRemoteModelsQuery } from '@/lib/hooks';
import type { RawConfig } from '@/lib/types';

import { InputWithMenu } from '../InputWithMenu';
import { Button } from '../ui/button';
import { FormControl, FormField, FormItem } from '../ui/form';
import { LoadingIcon } from '../ui/icons/LoadingIcon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

type Props = {
  config: RawConfig;
  enabledByDefault: boolean;
};

export function RemoteModelsSelector({ config, enabledByDefault }: Props) {
  const { t } = useTranslation(['error']);
  const form = useFormContext();
  const [enabled, setEnabled] = useState(enabledByDefault);
  const [manual, setManual] = useState(false);
  const [inited, setInited] = useState(false);
  const { data, isLoading, error } = useListRemoteModelsQuery({
    config,
    enabled,
    select: (raw) => raw.sort((a, b) => (a.id < b.id ? -1 : 1)),
  });
  const queryClient = useQueryClient();

  const onClick = useCallback(() => {
    if (
      config.provider === PROVIDER_OPENAI ||
      config.provider === PROVIDER_CLAUDE ||
      config.provider === PROVIDER_OPENROUTER ||
      config.provider === PROVIDER_DEEPSEEK ||
      config.provider === PROVIDER_XAI ||
      config.provider === PROVIDER_GOOGLE
    ) {
      // check api key when user is using OpenAI or OpenRouter
      const apiKey = form.getValues('apiKey');
      if (!apiKey || apiKey.length === 0) {
        form.setError('apiKey', {
          type: 'custom',
          message: t('error:validation:empty-api-key'),
        });
      } else {
        setEnabled(true);
      }
    } else if (config.provider === PROVIDER_OLLAMA) {
      // check endpoint when user is using Ollama
      const endpoint = form.getValues('endpoint');
      if (!endpoint || endpoint.length === 0) {
        form.setError('endpoint', {
          type: 'custom',
          message: t('error:validation:empty-endpoint'),
        });
      } else {
        setEnabled(true);
      }
    }
  }, [config, form, t]);

  const renderManualInput = () => {
    return (
      <FormField
        control={form.control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <InputWithMenu {...field} className="w-44 max-w-44" />
            </FormControl>
          </FormItem>
        )}
      />
    );
  };

  const render = () => {
    if (isLoading) {
      return (
        <div className="flex h-9 w-44 max-w-44">
          <LoadingIcon className="my-auto h-6 self-start" />
        </div>
      );
    }
    if (inited && data && data.length > 0) {
      if (manual) {
        return renderManualInput();
      }

      return (
        <FormField
          control={form.control}
          name="model"
          defaultValue={data[0].id}
          render={({ field }) => {
            return (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-44 max-w-44">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {data.map((m) => (
                      <SelectItem value={m.id} key={m.id}>
                        {m.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            );
          }}
        />
      );
    }

    return (
      <Button
        variant="secondary"
        type="button"
        onClick={onClick}
        className="w-44 max-w-44"
      >
        {t('generic:action:load-models')}
      </Button>
    );
  };

  useEffect(() => {
    queryClient.removeQueries({
      queryKey: LIST_REMOTE_MODELS_KEY,
      exact: true,
    });

    return () => {
      queryClient.cancelQueries({ queryKey: LIST_REMOTE_MODELS_KEY });
    };
  }, [queryClient]);

  useEffect(() => {
    // init when data is ready
    // should run only once
    if (!inited && data && data.length > 0) {
      const fieldValue = form.getValues('model') as string | undefined;
      if (!fieldValue || fieldValue.length === 0) {
        // field is empty, init to first model
        form.setValue('model', data[0].id);
      } else {
        const isInList = data.some((m) => m.id === fieldValue);
        if (!isInList) {
          // when the form value is not in the list,
          // set to manual mode
          setManual(true);
        }
      }
      setInited(true);
    }
  }, [inited, data, form]);

  useEffect(() => {
    // run after the component is inited
    // when the mode is changed
    if (inited && data && data.length > 0) {
      const fieldValue = form.getValues('model') as string | undefined;
      const isInList = data.some((m) => m.id === fieldValue);

      if (!manual && !isInList) {
        // when data is ready
        // and the component is in select mode,
        // but the form value is not in the list,
        // set the first model as field value
        form.setValue('model', data[0].id);
      }
    }
  }, [inited, data, form, manual]);

  useEffect(() => {
    if (error && !form.getFieldState('model').error) {
      form.setError('model', { type: 'custom', message: error.message });
    }
  }, [error, form]);

  return (
    <div className="flex gap-2">
      {render()}
      <Button
        type="button"
        variant="ghost"
        onClick={() => setManual((old) => !old)}
      >
        <Pencil className="size-4" />
      </Button>
    </div>
  );
}
