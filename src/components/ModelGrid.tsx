import { Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SETTING_USER_DEFAULT_MODEL } from '@/lib/constants';
import { useAppStateStore } from '@/lib/store';
import type { Model } from '@/lib/types';
import { getModelAlias } from '@/lib/utils';

import { ProviderTag } from './ProviderTag';
import { Button } from './ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from './ui/card';
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

  return (
    <Card className="min-h-32 border border-border">
      <CardHeader className="items-center space-y-2 p-4 md:p-6">
        <CardTitle className="mx-auto max-w-32 overflow-hidden truncate text-base md:max-w-48">
          {getModelAlias(model)}
        </CardTitle>
        <ProviderTag provider={model.provider} />
      </CardHeader>
      <CardFooter className="mt-6 p-4 md:p-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col items-center gap-1 sm:flex-row">
            <Switch
              id="default-switch"
              checked={isDefault}
              disabled={isDefault}
              onCheckedChange={onCheckedChange}
              className="disabled:opacity-100"
            />
            <Label
              htmlFor="default-switch"
              className="text-xs font-medium text-muted-foreground peer-disabled:text-foreground peer-disabled:opacity-100 sm:text-sm"
            >
              {t('generic:label:default')}
            </Label>
          </div>
          <Button variant="secondary" onClick={() => onEditClick(model)}>
            <Pencil className="size-4 sm:hidden" />
            <span className="hidden sm:inline">{t('generic:action:edit')}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ModelGrid({
  models,
  onDefaultChange,
  onEdit,
}: {
  models: Model[];
  onDefaultChange: (defaultModelId: number) => void;
  onEdit: (model: Model) => void;
}) {
  const { settings } = useAppStateStore();
  const defaultModelId =
    parseInt(settings[SETTING_USER_DEFAULT_MODEL], 10) || (models[0]?.id ?? 0);

  return (
    <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {models.map((model) => {
        return (
          <ModelGridItem
            model={model}
            isDefault={model.id === defaultModelId}
            key={model.id}
            onDefaultChange={onDefaultChange}
            onEditClick={onEdit}
          />
        );
      })}
    </div>
  );
}
