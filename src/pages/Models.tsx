import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@radix-ui/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { ModelGrid } from '@/components/ModelGrid';
import { TitleBar } from '@/components/TitleBar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { KEY_SETTING_DEFAULT_MODEL, PROVIDER_AZURE } from '@/lib/constants';
import { LIST_MODELS_KEY, useCreateModel, useUpsertSetting } from '@/lib/hooks';
import log from '@/lib/log';
import { modelFormSchema } from '@/lib/schemas';
import { useAppStateStore } from '@/lib/store';
import type { SupportedProviders, UnsavedModel } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ModelsPage() {
  const { models, updateSetting } = useAppStateStore();
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const form = useForm<UnsavedModel>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      apiKey: '',
      endpoint: '',
      deploymentId: '',
      // TODO: this is needed to avoid React's uncontrolled input warning;
      // this form should be refactored into forms that match providers
      provider: PROVIDER_AZURE,
    },
  });
  const queryClient = useQueryClient();
  const hasModels = models.length > 0;

  // Queries
  const createModelMutation = useCreateModel();
  const upsertSettingMutation = useUpsertSetting();

  // Callbacks
  const toggleModal = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      form.reset();
    }
  };

  const onSubmit: SubmitHandler<UnsavedModel> = (formData) => {
    toggleModal(false);
    log.info(`Formdata: ${JSON.stringify(formData)}`);
    createModelMutation.mutate(formData, {
      onSuccess(result) {
        log.info(`Model created: ${JSON.stringify(result)}`);
        queryClient.invalidateQueries({ queryKey: LIST_MODELS_KEY });
      },
      onError(error) {
        log.error(error);
        toast({
          variant: 'destructive',
          title: error.type,
          description: error.message,
        });
      },
    });
  };

  const onDefaultChange = (defaultModelId: number) => {
    upsertSettingMutation.mutate(
      {
        key: KEY_SETTING_DEFAULT_MODEL,
        value: defaultModelId.toString(),
      },
      {
        onSuccess(result) {
          log.info(`Setting upserted: ${JSON.stringify(result)}`);
          updateSetting(result);
        },
      }
    );
  };

  const renderCreateModelDialog = (provider: SupportedProviders) => {
    // form.setValue('provider', provider);
    return (
      <Dialog open={showModal} onOpenChange={toggleModal}>
        <DialogTrigger asChild>
          <Button className="mx-auto w-32 bg-slate-900">
            <PlusIcon className="size-4 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Create a {provider} model</DialogTitle>
                <DialogDescription>
                  Fill in your {provider}&apos;s API information. You can find
                  more information here.
                </DialogDescription>
              </DialogHeader>
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
                  name="deploymentId"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                      <FormLabel className="text-right">
                        Deployment ID
                      </FormLabel>
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
                          value={provider}
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  // Hooks

  return (
    <>
      <TitleBar title="Models" />
      <div className="flex grow justify-center">
        <div className="w-[1080px] max-w-[1080px]">
          <div
            className={cn(
              'flex flex-col px-[34px] min-h-[348px]',
              hasModels ? 'mt-6' : 'mt-48 items-center'
            )}
          >
            {hasModels ? (
              <>
                <h2 className="text-3xl font-semibold">Your Models</h2>
                <ModelGrid models={models} onDefaultChange={onDefaultChange} />
              </>
            ) : (
              <>
                <h2 className="text-3xl font-semibold">
                  You have no models yet
                </h2>
                <p className="mt-4 text-sm">Add one from below</p>
              </>
            )}
          </div>
          <Separator className="mt-36" />
          <div className="px-[34px]">
            <h2 className="my-6 text-xl font-semibold">Supported Models</h2>
            <div className="grid grid-cols-4 gap-5">
              <Card className="border-2 border-slate-900 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="mx-auto">Microsoft Azure</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-center">GPT-3.5 and GPT-4</p>
                </CardContent>
                <CardFooter>
                  {renderCreateModelDialog(PROVIDER_AZURE)}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
