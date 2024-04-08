import { useQueryClient } from '@tanstack/react-query';
import type { SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SlideUpTransition } from '@/components/animation/SlideUpTransition';
import ModelFormDialog from '@/components/ModelFormDialog';
import { ModelGrid } from '@/components/ModelGrid';
import { TitleBar } from '@/components/TitleBar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import TwoRows from '@/layouts/TwoRows';
import {
  SETTING_USER_DEFAULT_MODEL,
  SUPPORTED_PROVIDERS,
} from '@/lib/constants';
import {
  LIST_MODELS_KEY,
  useCreateModelMutation,
  useUpsertSettingMutation,
} from '@/lib/hooks';
import log from '@/lib/log';
import { useAppStateStore } from '@/lib/store';
import type { NewModel } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ModelsPage() {
  const { t } = useTranslation(['generic', 'page-models']);
  const { models, updateSetting } = useAppStateStore();
  const queryClient = useQueryClient();
  const hasModels = models.length > 0;

  // Queries
  const createModelMutation = useCreateModelMutation();
  const upsertSettingMutation = useUpsertSettingMutation();

  // Callbacks
  const onSubmit: SubmitHandler<NewModel> = (formData) => {
    log.info(`Formdata: ${JSON.stringify(formData)}`);
    createModelMutation.mutate(formData, {
      onSuccess: async (result) => {
        log.info(`Model created: ${JSON.stringify(result)}`);
        return queryClient.invalidateQueries({ queryKey: LIST_MODELS_KEY });
      },
      onError: (error) => {
        log.error(error);
        toast.error(`${error.type}: ${error.message}`);
      },
    });
  };

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
      <TwoRows>
        <TwoRows.Top>
          <TitleBar title={t('page-models:title')} />
        </TwoRows.Top>
        <TwoRows.Bottom>
          <div className="flex size-full justify-center">
            <div className="w-[1080px] max-w-[1080px]">
              <div
                className={cn(
                  'flex flex-col px-[34px] min-h-[348px] mt-6',
                  hasModels ? null : 'justify-center items-center'
                )}
              >
                {hasModels ? (
                  <>
                    <h2 className="text-3xl font-semibold tracking-tight">
                      {t('page-models:section:your-models')}
                    </h2>
                    <ModelGrid
                      models={models}
                      onDefaultChange={onDefaultChange}
                    />
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-semibold tracking-tight">
                      {t('page-models:text:no-model')}
                    </h2>
                    <p className="mt-4 text-sm">
                      {t('page-models:text:add-model')}
                    </p>
                  </>
                )}
              </div>
              <Separator />
              <div className="px-[34px]">
                <h2 className="my-6 text-xl font-semibold tracking-tight">
                  {t('page-models:section:supported-models')}
                </h2>
                <div className="grid grid-cols-4 gap-5">
                  {SUPPORTED_PROVIDERS.map((provider) => (
                    <Card className="border-2 border-slate-900 shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="mx-auto">
                          {t(`generic:model:${provider}`)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-center">GPT-3.5 and GPT-4</p>
                      </CardContent>
                      <CardFooter>
                        <ModelFormDialog.New
                          provider={provider}
                          onSubmit={onSubmit}
                          key={`${provider}-form-dialog`}
                        />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TwoRows.Bottom>
      </TwoRows>
    </SlideUpTransition>
  );
}
