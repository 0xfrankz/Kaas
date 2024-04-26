import { forwardRef, useImperativeHandle, useState } from 'react';

import type { DialogHandler } from '@/lib/types';

import { Dialog, DialogContent } from './ui/dialog';

type DialogProps = {
  onSubmit: () => void;
};
const NewPromptFormDialog = forwardRef<DialogHandler, DialogProps>(
  ({ onSubmit }, ref) => {
    const [showDialog, setShowDialog] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setShowDialog(true),
      close: () => setShowDialog(false),
    }));

    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <h1>Create a prompt template</h1>
        </DialogContent>
      </Dialog>
    );
  }
);

export default {
  New: NewPromptFormDialog,
};
