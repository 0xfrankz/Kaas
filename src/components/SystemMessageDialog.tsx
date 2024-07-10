import { useQueryClient } from '@tanstack/react-query';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { MESSAGE_SYSTEM } from '@/lib/constants';
import {
  SYSTEM_MESSAGE_KEY,
  useGetSystemMessageQuery,
  useMessageCreator,
  useMessageHardDeleter,
  useMessageUpdater,
} from '@/lib/hooks';
import type {
  CommandError,
  ConversationDetails,
  DialogHandler,
  Message,
} from '@/lib/types';
import { buildTextContent, getTextFromMessage } from '@/lib/utils';

import { AutoFitTextarea } from './AutoFitTextarea';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type DialogProps = {};

export const SystemMessageDialog = forwardRef<
  DialogHandler<ConversationDetails>,
  DialogProps
>((_, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [conversation, setConversation] = useState<
    ConversationDetails | undefined
  >(undefined);
  const { data: message } = useGetSystemMessageQuery({
    conversationId: conversation?.id ?? 0,
    // enabled: !!conversation,
  });
  const { t } = useTranslation(['page-conversation']);
  const queryClient = useQueryClient();
  const defaultCallback = useCallback(
    (sysMsg: Message | undefined, error: CommandError | null) => {
      setShowDialog(false);
      if (error) {
        toast.error(
          t('page-conversation:message:set-system-message-error', {
            errorMsg: error.message,
          })
        );
      } else if (sysMsg) {
        queryClient.setQueryData(
          [...SYSTEM_MESSAGE_KEY, { conversationId: sysMsg.conversationId }],
          () => {
            return sysMsg;
          }
        );
        toast.success(
          t('page-conversation:message:set-system-message-success')
        );
      }
    },
    [queryClient, t]
  );
  const creator = useMessageCreator({
    onSuccess: () => {
      // override default behaviour to avoid system message appear in list
    },
    onSettled: (sysMsg, error) => {
      defaultCallback(sysMsg, error);
    },
  });
  const updater = useMessageUpdater({
    onSettled: (sysMsg, error) => {
      defaultCallback(sysMsg, error);
    },
  });
  const deleter = useMessageHardDeleter({
    onSettled: (sysMsg, error) => {
      setShowDialog(false);
      if (error) {
        toast.error(
          t('page-conversation:message:unset-system-message-error', {
            errorMsg: error.message,
          })
        );
      } else if (sysMsg) {
        queryClient.setQueryData(
          [...SYSTEM_MESSAGE_KEY, { conversationId: sysMsg.conversationId }],
          () => {
            return null;
          }
        );
        toast.success(
          t('page-conversation:message:unset-system-message-success')
        );
      }
    },
  });

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
    // create, update or deleter
    if (conversation) {
      if (message) {
        // update or delete
        const mStr = taRef.current?.value ?? '';
        const mData = {
          id: message.id,
          content: buildTextContent(mStr),
          conversationId: conversation?.id,
          role: MESSAGE_SYSTEM,
        };
        if (mStr.trim().length === 0) {
          deleter(mData);
        } else {
          updater(mData);
        }
      } else {
        // create
        creator({
          content: buildTextContent(taRef.current?.value ?? ''),
          conversationId: conversation?.id,
          role: MESSAGE_SYSTEM,
        });
      }
    }
  }, [conversation, creator, deleter, message, updater]);
  return conversation ? (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="line-clamp-2 whitespace-pre-wrap leading-5">
            {t('page-conversation:section:set-system-message', {
              subject: conversation.subject,
            })}
          </DialogTitle>
          <DialogDescription className="whitespace-pre-wrap">
            {t('page-conversation:message:set-system-message-tips')}
          </DialogDescription>
        </DialogHeader>
        <div>
          <AutoFitTextarea
            ref={taRef}
            className="rounded-xl p-2"
            rows={5}
            defaultValue={message ? getTextFromMessage(message) : ''}
          />
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
