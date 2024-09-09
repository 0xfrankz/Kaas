import React, { forwardRef, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Checkbox } from '@/components/ui/checkbox';
import type { Model } from '@/lib/types';
import { cn, getModelAlias } from '@/lib/utils';

import { FieldErrorMessage } from './FieldErrorMessage';
import { ProviderIcon } from './ProviderIcon';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type ModelPickerProps = React.HTMLAttributes<HTMLDivElement> & {
  models: Model[];
  onUseClick: (models: Model[]) => void;
};

type StatefulModel = Model & {
  selected: boolean;
};

const MultiModelPickerItem = ({
  model,
  index,
}: {
  model: StatefulModel;
  index: number;
}) => {
  const [checked, setChecked] = useState(false);
  const onClick = (
    e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setChecked((old) => {
      model.selected = !old;
      return !old;
    });
  };
  return (
    <div
      className="group mx-auto flex w-64 cursor-pointer items-center justify-start gap-2 rounded-lg border p-4 hover:border-primary sm:w-48"
      role="checkbox"
      aria-checked={checked}
      tabIndex={index}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          e.preventDefault();
          setChecked((old) => !old);
        }
      }}
    >
      <Checkbox
        className="border-foreground group-hover:border-primary"
        checked={checked}
        onClick={onClick}
      />
      <ProviderIcon provider={model.provider} />
      <span className="line-clamp-1 text-left text-sm">
        {getModelAlias(model)}
      </span>
    </div>
  );
};

const MultiModelPicker = forwardRef<HTMLDivElement, ModelPickerProps>(
  ({ className, models, onUseClick, ...props }, ref) => {
    const [error, setError] = useState<string>();
    const { t } = useTranslation();
    const modelsWithState = useMemo(
      () =>
        models.map((model) => ({
          ...model,
          selected: false,
        })),
      [models]
    );

    const onClick = () => {
      const selectedModels = modelsWithState.filter((model) => model.selected);
      if (selectedModels.length > 0) {
        onUseClick(selectedModels);
      } else {
        setError(t('error:validation:empty-models'));
      }
    };
    return (
      <>
        {error && <FieldErrorMessage message={error} />}
        <div
          ref={ref}
          className={cn(
            'grid grid-cols-1 gap-4 w-64 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:w-[400px] md:w-[612px] lg:w-[816px]',
            className
          )}
          {...props}
        >
          {modelsWithState.map((model, index) => (
            <MultiModelPickerItem
              key={model.id}
              model={model}
              index={index + 1}
            />
          ))}
        </div>
        <Button onClick={onClick} className="ml-auto w-fit">
          {t('generic:action:use-selected-models')}
        </Button>
      </>
    );
  }
);

const SingleModelPicker = forwardRef<HTMLDivElement, ModelPickerProps>(
  ({ className, models, onUseClick, ...props }, ref) => {
    const [selectedModel, setSelectedModel] = useState(models[0]);
    const { t } = useTranslation();
    return (
      <div
        className={cn('flex flex-col gap-4 sm:flex-row', className)}
        {...props}
        ref={ref}
      >
        <Select
          onValueChange={(v) => {
            setSelectedModel(models[parseInt(v, 10)]);
          }}
          defaultValue="0"
        >
          <SelectTrigger className="w-64 gap-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {models.map((model, index) => (
              <SelectItem value={index.toString()} key={model.id}>
                <div className="flex items-center gap-2">
                  <ProviderIcon provider={model.provider} />
                  {getModelAlias(model)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => onUseClick([selectedModel])}>
          {t('generic:action:use-this-model')}
        </Button>
      </div>
    );
  }
);

MultiModelPicker.displayName = 'MultiModelPicker';

export default {
  Multi: MultiModelPicker,
  Single: SingleModelPicker,
};
