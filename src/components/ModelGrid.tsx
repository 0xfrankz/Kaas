import { KEY_SETTING_DEFAULT_MODEL } from '@/lib/constants';
import { useAppStateStore } from '@/lib/store';
import type { Model } from '@/lib/types';

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
}: {
  model: Model;
  isDefault: boolean;
  onDefaultChange: (defaultModelId: number) => void;
}) {
  const onCheckedChange = (checked: boolean) => {
    if (checked) {
      onDefaultChange(model.id);
    }
  };
  const getModelName = (m: Model): string => {
    switch (m.provider) {
      case 'Azure':
        return m.deploymentId;
      case 'OpenAI':
        return m.model;
      default:
        return '';
    }
  };
  return (
    <Card className="min-h-32 border-2 border-slate-900 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="mx-auto">Microsoft Azure</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-center">{getModelName(model)}</p>
      </CardContent>
      <CardFooter>
        <div className="mx-auto flex items-center space-x-2">
          <Switch
            id="airplane-mode"
            checked={isDefault}
            disabled={isDefault}
            onCheckedChange={onCheckedChange}
            className="disabled:opacity-100"
          />
          <Label htmlFor="airplane-mode" className="font-medium">
            Default
          </Label>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ModelGrid({
  models,
  onDefaultChange,
}: {
  models: Model[];
  onDefaultChange: (defaultModelId: number) => void;
}) {
  const { settings } = useAppStateStore();
  const defaultModelId =
    parseInt(settings[KEY_SETTING_DEFAULT_MODEL], 10) || (models[0]?.id ?? 0);

  return (
    <div className="mt-6 grid grid-cols-4 gap-5">
      {models.map((model) => {
        return (
          <ModelGridItem
            model={model}
            isDefault={model.id === defaultModelId}
            key={model.id}
            onDefaultChange={onDefaultChange}
          />
        );
      })}
    </div>
  );
}
