import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { MESSAGE_SYSTEM } from '@/lib/constants';
import type {
  ConversationDetails,
  DialogHandler,
  NewMessage,
} from '@/lib/types';

import { AutoFitTextarea } from './AutoFitTextarea';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type DialogProps = {
  onSubmit: (systemMessage: NewMessage) => void;
};

export const SystemMessageDialog = forwardRef<
  DialogHandler<ConversationDetails>,
  DialogProps
>(({ onSubmit }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
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

  const onClick = useCallback(() => {
    if (conversation) {
      onSubmit({
        content: taRef.current?.value ?? '',
        conversationId: conversation?.id,
        role: MESSAGE_SYSTEM,
      });
    }
  }, [conversation]);

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
          <AutoFitTextarea ref={taRef} className="rounded-xl p-2" rows={5} />
        </div>
        <div className="flex h-fit items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDialog(false)}>
            {t('generic:action:cancel')}
          </Button>
          <Button onClick={onClick}>{t('generic:action:set')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  ) : null;
});
