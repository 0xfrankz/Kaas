import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import type { AllProviders, DialogHandler, Model, NewModel } from '@/lib/types';

import ModelFormDialogContent from './Models/ModelFormDialogContent';
import ProvidersGridDialogContent from './Models/ProvidersGridDialogContent';
import { Dialog, DialogContent } from './ui/dialog';

type NewModelDialogProps = {
  onSubmit: (model: NewModel) => void;
};

type EditModelDialogProps = {
  onSubmit: (model: Model) => void;
  onDelete: (model: Model) => void;
};

const NewModelFormDialogInner = ({
  onFormSubmit,
}: {
  onFormSubmit: (model: NewModel) => void;
}) => {
  const [provider, setProvider] = useState<AllProviders>();

  const onCloseAutoFocus = useCallback(() => {
    setProvider(undefined);
  }, []);

  const render = () => {
    return provider ? (
      <ModelFormDialogContent.New
        provider={provider as AllProviders}
        onResetClick={() => setProvider(undefined)}
        onFormSubmit={onFormSubmit}
      />
    ) : (
      <ProvidersGridDialogContent onClick={setProvider} />
    );
  };

  return (
    <DialogContent
      className="flex max-h-screen flex-col"
      onCloseAutoFocus={onCloseAutoFocus}
    >
      {render()}
    </DialogContent>
  );
};

const NewModelFormDialog = forwardRef<DialogHandler<void>, NewModelDialogProps>(
  ({ onSubmit }, ref) => {
    const [showDialog, setShowDialog] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => {
        setShowDialog(true);
      },
      close: () => {
        setShowDialog(false);
      },
    }));

    const onFormSubmit = useCallback(
      (model: NewModel) => {
        onSubmit(model);
        setShowDialog(false);
      },
      [onSubmit]
    );

    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <NewModelFormDialogInner onFormSubmit={onFormSubmit} />
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
      <DialogContent className="flex max-h-screen">
        <ModelFormDialogContent.Edit
          model={model}
          onFormSubmit={onFormSubmit}
          onDelete={onDelete}
        />
      </DialogContent>
    </Dialog>
  ) : null;
});

export default {
  New: NewModelFormDialog,
  Edit: EditModelFormDialog,
};
