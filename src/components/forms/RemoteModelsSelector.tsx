import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PROVIDER_OPENAI } from '@/lib/constants';
import { LIST_REMOTE_MODELS_KEY, useListRemoteModelsQuery } from '@/lib/hooks';
import type { RawConfig } from '@/lib/types';

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
  const { data, isLoading, error } = useListRemoteModelsQuery({
    config,
    enabled,
    select: (raw) => raw.sort((a, b) => (a.id < b.id ? -1 : 1)),
  });
  const queryClient = useQueryClient();

  if (error) {
    form.setError('model', { type: 'custom', message: error.message });
  }

  const onClick = useCallback(() => {
    if (config.provider === PROVIDER_OPENAI) {
      // check api key when user is using OpenAI
      const apiKey = form.getValues('apiKey');
      if (apiKey && apiKey.length === 0) {
        form.setError('apiKey', {
          type: 'custom',
          message: t('error:validation:empty-api-key'),
        });
      } else {
        setEnabled(true);
      }
    } else {
      // check endpoint when user is using Ollama
      const endpoint = form.getValues('endpoint');
      if (endpoint && endpoint.length === 0) {
        form.setError('endpoint', {
          type: 'custom',
          message: t('error:validation:empty-api-key'),
        });
      } else {
        setEnabled(true);
      }
    }
  }, [config.provider, form, t]);

  const render = () => {
    if (isLoading) {
      return (
        <div className="flex h-9">
          <LoadingIcon className="my-auto h-6 self-start" />
        </div>
      );
    }
    if (data) {
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
                    <SelectTrigger>
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
      <Button variant="secondary" type="button" onClick={onClick}>
        {t('generic:action:load-models')}
      </Button>
    );
  };

  useEffect(() => {
    queryClient.removeQueries({
      queryKey: LIST_REMOTE_MODELS_KEY,
      exact: true,
    });
  }, [queryClient]);

  useEffect(() => {
    if (data && data.length > 0) {
      const fieldValue = form.getValues('model') as string | undefined;
      if (!fieldValue || fieldValue.length === 0) {
        form.setValue('model', data[0].id);
      }
    }
  }, [data, form]);

  return render();
}
