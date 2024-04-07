import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { modelFormSchema } from '@/lib/schemas';
import type { SupportedProviders, UnsavedModel } from '@/lib/types';

import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';

type Props = {
  provider: SupportedProviders;
  onSubmit: (model: UnsavedModel) => void;
};

export function CreateModelFormDialog({ provider, onSubmit }: Props) {
  const [showModal, setShowModal] = useState(false);
  const form = useForm<UnsavedModel>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      apiKey: '',
      endpoint: '',
      apiVersion: '',
      deploymentId: '',
      provider,
    },
  });

  // Callbacks
  const toggleModal = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      form.reset();
    }
  };

  const render = () => {
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
                  name="apiVersion"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-x-4 gap-y-1 space-y-0">
                      <FormLabel className="text-right">API Version</FormLabel>
                      <FormControl>
                        <Input className="col-span-3" {...field} />
                      </FormControl>
                      <div className="col-span-3 col-start-2">
                        <FormMessage />
                        <FormDescription>
                          This is the version of your Azure API.
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

  return render();
}
