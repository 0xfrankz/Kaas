import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppStateStore } from '@/lib/store';
import type { Model, StatefulDialogHandler } from '@/lib/types';
import { getModelAlias } from '@/lib/utils';

import { ProviderIcon } from './ProviderIcon';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type DialogProps = {
  onSubmit: (model: Model) => void;
};

export const ModelPickerDialog = forwardRef<
  StatefulDialogHandler<string>,
  DialogProps
>(({ onSubmit }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const isOpenRef = useRef(false);
  const [subject, setSubject] = useState('');
  const { t } = useTranslation(['page-conversation']);
  const { models } = useAppStateStore();
  const defaultModel = models[0];
  isOpenRef.current = showDialog;
  const selectedModelRef = useRef<number>(defaultModel.id);

  useImperativeHandle(ref, () => ({
    open: (titleSubject) => {
      setSubject(titleSubject ?? '');
      setShowDialog(true);
    },
    close: () => {
      setShowDialog(false);
    },
    isOpen: () => isOpenRef.current,
  }));

  const onClick = () => {
    const selectedModel = models.find((m) => m.id === selectedModelRef.current);
    onSubmit(selectedModel!);
    setShowDialog(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('page-conversation:section:choose-model', { subject })}
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-4">
          <Select
            onValueChange={(v) => {
              selectedModelRef.current = parseInt(v, 10);
            }}
            defaultValue={defaultModel.id.toString()}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem value={model.id.toString()} key={model.id}>
                  <div className="flex gap-2">
                    <ProviderIcon provider={model.provider} />
                    {getModelAlias(model)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onClick}>
            {t('generic:action:use-this-model')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
