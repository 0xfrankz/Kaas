import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  PROVIDER_AZURE,
  PROVIDER_OPENAI,
  SETTING_USER_DEFAULT_MODEL,
} from '@/lib/constants';
import { useAppStateStore } from '@/lib/store';
import type { DialogHandler, EditModel, Model } from '@/lib/types';

import ModelFormDialog from './ModelFormDialog';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

function ModelGridItem({
  model,
  isDefault,
  onDefaultChange,
  onEditClick,
}: {
  model: Model;
  isDefault: boolean;
  onDefaultChange: (defaultModelId: number) => void;
  onEditClick: (model: Model) => void;
}) {
  const { t } = useTranslation();
  const onCheckedChange = (checked: boolean) => {
    if (checked) {
      onDefaultChange(model.id);
    }
  };
  const getModelName = (m: Model): string => {
    switch (m.provider) {
      case PROVIDER_AZURE:
        return m.deploymentId;
      case PROVIDER_OPENAI:
        return m.model;
      default:
        return '';
    }
  };
  return (
    <Card className="min-h-32 border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="mx-auto">
          {t(`generic:model:${model.provider}`)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-center">{getModelName(model)}</p>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1">
            <Switch
              id="default-switch"
              checked={isDefault}
              disabled={isDefault}
              onCheckedChange={onCheckedChange}
              className="disabled:opacity-100"
            />
            <Label
              htmlFor="default-switch"
              className="font-medium text-muted-foreground peer-disabled:text-foreground peer-disabled:opacity-100"
            >
              {t('generic:label:default')}
            </Label>
          </div>
          <Button variant="secondary" onClick={() => onEditClick(model)}>
            {t('generic:action:edit')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ModelGrid({
  models,
  onDefaultChange,
  onUpdateSubmit,
  onDelete,
}: {
  models: Model[];
  onDefaultChange: (defaultModelId: number) => void;
  onUpdateSubmit: (model: EditModel) => void;
  onDelete: (model: EditModel) => void;
}) {
  const { settings } = useAppStateStore();
  const editPromptDialogRef = useRef<DialogHandler<Model>>(null);
  const defaultModelId =
    parseInt(settings[SETTING_USER_DEFAULT_MODEL], 10) || (models[0]?.id ?? 0);

  const onEditClick = useCallback((model: Model) => {
    editPromptDialogRef.current?.open(model);
  }, []);

  return (
    <div className="mt-6 grid grid-cols-4 gap-5">
      {models.map((model) => {
        return (
          <ModelGridItem
            model={model}
            isDefault={model.id === defaultModelId}
            key={model.id}
            onDefaultChange={onDefaultChange}
            onEditClick={onEditClick}
          />
        );
      })}
      <ModelFormDialog.Edit
        ref={editPromptDialogRef}
        onSubmit={onUpdateSubmit}
        onDeleteClick={onDelete}
      />
    </div>
  );
}
