import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AllProviders, DialogHandler, Model, NewModel } from '@/lib/types';

import ModelFormDialogContent from './Models/ModelFormDialogContent';
import ProvidersGridDialogContent from './Models/ProvidersGridDialogContent';
import { Dialog } from './ui/dialog';

type NewModelDialogProps = {
  onSubmit: (model: NewModel) => void;
};

type EditModelDialogProps = {
  onSubmit: (model: Model) => void;
  onDelete: (model: Model) => void;
};

const NewModelFormDialog = forwardRef<DialogHandler<void>, NewModelDialogProps>(
  ({ onSubmit }, ref) => {
    const [showDialog, setShowDialog] = useState(false);
    const [provider, setProvider] = useState<AllProviders>();
    const { t } = useTranslation(['generic']);

    useImperativeHandle(ref, () => ({
      open: () => {
        setShowDialog(true);
      },
      close: () => {
        setProvider(undefined);
        setShowDialog(false);
      },
    }));

    const onFormSubmit = (model: NewModel) => {
      onSubmit(model);
      setShowDialog(false);
    };

    useEffect(() => {
      if (!showDialog) {
        setProvider(undefined);
      }
    }, [showDialog]);

    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        {provider ? (
          <ModelFormDialogContent.New
            provider={provider as AllProviders}
            onResetClick={() => setProvider(undefined)}
            onFormSubmit={onFormSubmit}
          />
        ) : (
          <ProvidersGridDialogContent onClick={setProvider} />
        )}
      </Dialog>
    );
  }
);

const EditModelFormDialog = forwardRef<
  DialogHandler<Model>,
  EditModelDialogProps
>(({ onSubmit, onDelete }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const [model, setModel] = useState<Model>();

  useImperativeHandle(ref, () => ({
    open: (defaultValue?: Model) => {
      setModel(defaultValue);
      setShowDialog(true);
    },
    close: () => {
      setModel(undefined);
      setShowDialog(false);
    },
  }));

  const onFormSubmit = (updatedModel: Model) => {
    onSubmit(updatedModel);
    setShowDialog(false);
  };

  return model ? (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <ModelFormDialogContent.Edit
        model={model}
        onFormSubmit={onFormSubmit}
        onDelete={onDelete}
      />
    </Dialog>
  ) : null;
});

export default {
  New: NewModelFormDialog,
  Edit: EditModelFormDialog,
};
