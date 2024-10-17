import { useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import ModelFormDialog from '@/components/ModelFormDialog';
import { ModelGrid } from '@/components/ModelGrid';
import { ModelCreator } from '@/components/Models/ModelCreator';
import NoModels from '@/components/Models/NoModels';
import SectionTitle from '@/components/SectionTitle';
import { TitleBar } from '@/components/TitleBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import TwoRows from '@/layouts/TwoRows';
import { SETTING_USER_DEFAULT_MODEL } from '@/lib/constants';
import {
  LIST_MODELS_KEY,
  useModelDeleter,
  useModelUpdater,
  useUpsertSettingMutation,
} from '@/lib/hooks';
import log from '@/lib/log';
import { useAppStateStore } from '@/lib/store';
import type { DialogHandler, Model } from '@/lib/types';

export default function ModelsPage() {
  const { t } = useTranslation(['generic', 'page-models']);
  const editPromptDialogRef = useRef<DialogHandler<Model>>(null);
  const { models, updateSetting } = useAppStateStore();
  const queryClient = useQueryClient();
  const hasModels = models.length > 0;

  // Queries
  const upsertSettingMutation = useUpsertSettingMutation();
  const deleter = useModelDeleter({
    onSuccess: async (model) => {
      // Update cache
      queryClient.setQueryData<Model[]>(LIST_MODELS_KEY, (old) =>
        produce(old, (draft) => {
          return draft?.filter((p) => p.id !== model.id);
        })
      );
      // Show toast
      toast.success(t('page-models:message:delete-model-success'));
      // Close dialog
      editPromptDialogRef.current?.close();
    },
    onError: async (error, variables) => {
      await log.error(
        `Failed to delete model: data = ${JSON.stringify(variables)}, error = ${error.message}`
      );
      toast.error(
        t('page-models:message:delete-model-error', {
          errorMsg: error.message,
        })
      );
    },
  });
  const updater = useModelUpdater({
    onSuccess: async (model) => {
      // Update cache
      queryClient.setQueryData<Model[]>(LIST_MODELS_KEY, (old) =>
        produce(old, (draft) => {
          const index = draft?.findIndex((p) => p.id === model.id) ?? -1;
          if (index !== -1 && draft) {
            draft[index] = model;
          }
        })
      );
      // Show toast
      toast.success(t('page-models:message:update-model-success'));
      // Close dialog
      editPromptDialogRef.current?.close();
    },
    onError: async (error, variables) => {
      await log.error(
        `Failed to update model: data = ${JSON.stringify(variables)}, error = ${error.message}`
      );
      toast.error(`Failed to update model: ${error.message}`);
    },
  });

  // Callbacks
  const onEdit = useCallback((model: Model) => {
    editPromptDialogRef.current?.open(model);
  }, []);

  const onUpdateSubmit = useCallback(
    (model: Model) => {
      updater(model);
    },
    [updater]
  );

  const onDelete = useCallback(
    (model: Model) => {
      deleter(model.id);
    },
    [deleter]
  );

  const onDefaultChange = (defaultModelId: number) => {
    upsertSettingMutation.mutate(
      {
        key: SETTING_USER_DEFAULT_MODEL,
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

  return (
    <SlideUpTransition motionKey="models">
      <TwoRows className="h-screen max-h-screen">
        <TwoRows.Top>
          <TitleBar title={t('page-models:title')} />
        </TwoRows.Top>
        <TwoRows.Bottom className="flex overflow-hidden">
          <ScrollArea className="grow">
            <div className="mx-4 mb-6 mt-12 flex flex-col md:mx-8">
              {hasModels ? (
                <>
                  <div className="flex justify-between">
                    <SectionTitle>
                      {t('page-models:section:your-models')}
                    </SectionTitle>
                    <ModelCreator />
                  </div>
                  <ModelGrid
                    models={models}
                    onDefaultChange={onDefaultChange}
                    onEdit={onEdit}
                  />
                </>
              ) : (
                <NoModels />
              )}
            </div>
          </ScrollArea>
          <ModelFormDialog.Edit
            ref={editPromptDialogRef}
            onSubmit={onUpdateSubmit}
            onDelete={onDelete}
          />
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
