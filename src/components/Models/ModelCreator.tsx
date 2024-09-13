import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { forwardRef, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { LIST_MODELS_KEY, useCreateModelMutation } from '@/lib/hooks';
import log from '@/lib/log';
import type { DialogHandler, NewModel } from '@/lib/types';
import { cn } from '@/lib/utils';

import ModelFormDialog from '../ModelFormDialog';
import type { ButtonProps } from '../ui/button';
import { Button } from '../ui/button';

export const ModelCreator = forwardRef<
  HTMLButtonElement,
  ButtonProps & { forceShowText?: boolean }
>(({ forceShowText = false, className, ...props }, ref) => {
  const { t } = useTranslation();
  const newModelDialogRef = useRef<DialogHandler<void>>(null);

  // Queries
  const queryClient = useQueryClient();
  const createModelMutation = useCreateModelMutation();

  // Callbacks
  const onCreateClick = () => {
    newModelDialogRef.current?.open();
  };

  const onCreateSubmit = useCallback(
    (model: NewModel) => {
      createModelMutation.mutate(model, {
        onSuccess: async (result) => {
          log.info(`Model created: ${JSON.stringify(result)}`);
          return queryClient.invalidateQueries({ queryKey: LIST_MODELS_KEY });
        },
        onError: (error) => {
          log.error(error);
          toast.error(`${error.type}: ${error.message}`);
        },
      });
    },
    [createModelMutation, queryClient]
  );

  return (
    <>
      <Button
        onClick={onCreateClick}
        ref={ref}
        {...props}
        className={className}
      >
        <Plus className="size-4" />
        <span
          className={cn('ml-2', forceShowText ? 'inline' : 'hidden lg:inline')}
        >
          {t('generic:action:create-new-model')}
        </span>
      </Button>
      <ModelFormDialog.New ref={newModelDialogRef} onSubmit={onCreateSubmit} />
    </>
  );
});
