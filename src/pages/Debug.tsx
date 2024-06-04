import 'react18-json-view/src/style.css';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import JsonView from 'react18-json-view';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import { invokeListRemoteModels } from '@/lib/commands';
import type { RemoteModel } from '@/lib/types';

type ListRemoteModelsInput = {
  provider: string;
  apiKey: string;
};

function DebugGroupBackendInvoker() {
  const { t } = useTranslation(['generic', 'page-debug']);
  const [data, setData] = useState<RemoteModel[]>();
  const form = useForm<ListRemoteModelsInput>();

  const onSubmit = useCallback(async (formData: ListRemoteModelsInput) => {
    const resp = await invokeListRemoteModels(
      formData.provider,
      formData.apiKey
    );
    setData(resp);
  }, []);

  return (
    <div className="flex break-inside-avoid flex-col">
      <span className="mb-1 text-sm font-semibold">
        {t('page-debug:label:be-invoker')}
      </span>
      <Card className="mt-1 flex flex-col gap-2 px-4 py-6">
        <div className="flex flex-col">
          <h3 className="mb-4 text-sm font-semibold">
            hooks:useListRemoteModelsQuery
          </h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="provider"
                defaultValue=""
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel className="text-right">
                      {t('page-debug:label:provider')}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apiKey"
                defaultValue=""
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel className="text-right">
                      {t('page-debug:label:api-key')}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-4">
                Call
              </Button>
            </form>
          </Form>
        </div>
        {data ? (
          <JsonView src={data} editable={false} enableClipboard={false} />
        ) : null}
      </Card>
    </div>
  );
}

export default function DebugPage() {
  return (
    <SlideUpTransition motionKey="debug">
      <TwoRows className="max-h-screen">
        <TwoRows.Top>
          <TitleBar title="Debug" />
        </TwoRows.Top>
        <TwoRows.Bottom className="flex overflow-hidden">
          <ScrollArea className="w-full grow">
            <div className="mx-auto mb-6 mt-12 w-[960px] columns-2 gap-8 text-foreground">
              <DebugGroupBackendInvoker />
            </div>
          </ScrollArea>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
