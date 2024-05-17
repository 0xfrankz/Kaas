import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  ConversationDetails,
  DialogHandler,
  NewMessage,
} from '@/lib/types';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Textarea } from './ui/textarea';

type DialogProps = {
  onSubmit: (systemMessage: NewMessage) => void;
};

export const SystemMessageDialog = forwardRef<
  DialogHandler<ConversationDetails>,
  DialogProps
>(({ onSubmit }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const [conversation, setConversation] = useState<
    ConversationDetails | undefined
  >(undefined);
  const { t } = useTranslation(['page-conversation']);

  useImperativeHandle(ref, () => ({
    open: (c) => {
      setShowDialog(true);
      setConversation(c);
    },
    close: () => {
      setShowDialog(false);
      setConversation(undefined);
    },
  }));

  return conversation ? (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('page-conversation:section:set-system-message', {
              subject: conversation.subject,
            })}
          </DialogTitle>
          <DialogDescription className="whitespace-pre-wrap">
            {t('page-conversation:message:set-system-message-tips')}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Textarea
            placeholder="You are a very helpful assistant."
            className="resize-none overflow-y-hidden border px-2"
            rows={1}
          />
        </div>
        <div className="flex h-fit items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDialog(false)}>
            {t('generic:action:cancel')}
          </Button>
          <Button>Set</Button>
        </div>
      </DialogContent>
    </Dialog>
  ) : null;
});
