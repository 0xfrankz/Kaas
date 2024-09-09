import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppStateStore } from '@/lib/store';
import type { Model, StatefulDialogHandler } from '@/lib/types';

import ModelPicker from './ModelPicker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

type DialogProps = {
  onSubmit: (models: Model[]) => void;
};

export const ModelPickerDialog = forwardRef<
  StatefulDialogHandler<string>,
  DialogProps
>(({ onSubmit }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const [useMultipleModels, setUseMultipleModels] = useState(false);
  const [subject, setSubject] = useState('');
  const isOpenRef = useRef(false);
  const { t } = useTranslation(['page-conversation']);
  const { models } = useAppStateStore();
  isOpenRef.current = showDialog;

  useImperativeHandle(ref, () => ({
    open: (titleSubject) => {
      setSubject(titleSubject ?? '');
      setShowDialog(true);
    },
    close: () => {
      setUseMultipleModels(false);
      setShowDialog(false);
    },
    isOpen: () => isOpenRef.current,
  }));

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent
        className="w-fit max-w-fit"
        onCloseAutoFocus={() => setUseMultipleModels(false)}
      >
        <DialogHeader>
          <DialogTitle>
            {t('page-conversation:section:choose-model', { subject })}
          </DialogTitle>
          <DialogDescription className="hidden">
            {t('page-conversation:section:choose-model', { subject })}
          </DialogDescription>
        </DialogHeader>
        {useMultipleModels ? (
          <ModelPicker.Multi models={models} onUseClick={onSubmit} />
        ) : (
          <ModelPicker.Single models={models} onUseClick={onSubmit} />
        )}
        <div className="flex items-center gap-2">
          <Switch id="multiple-models" onCheckedChange={setUseMultipleModels} />
          <Label
            htmlFor="multiple-models"
            className="text-nowrap text-sm sm:text-base"
          >
            {t('generic:action:use-multiple-models')}
          </Label>
        </div>
      </DialogContent>
    </Dialog>
  );
});
