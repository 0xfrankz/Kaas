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
import { FileUploaderContextProvider } from '@/lib/providers';
import type {
  CommandError,
  ContentItem,
  ConversationDetails,
  DialogHandler,
  Message,
  PromptInputHandler,
} from '@/lib/types';
import { getTextFromContent, getTextFromMessage } from '@/lib/utils';

import PromptInput from './PromptInput';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

type DialogProps = {};

export const SystemMessageDialog = forwardRef<
  DialogHandler<ConversationDetails>,
  DialogProps
>((_, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const promptInputRef = useRef<PromptInputHandler>(null);
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

  const onSubmit = useCallback(
    (content: ContentItem[]) => {
      // create, update or deleter
      if (conversation) {
        if (message) {
          // update or delete
          const mData = {
            id: message.id,
            content,
            conversationId: conversation?.id,
            role: MESSAGE_SYSTEM,
          };
          if (getTextFromContent(content).trim().length === 0) {
            deleter(mData);
          } else {
            updater(mData);
          }
        } else {
          // create
          creator({
            content,
            conversationId: conversation?.id,
            role: MESSAGE_SYSTEM,
          });
        }
      }
    },
    [conversation, creator, deleter, message, updater]
  );

  const onClick = () => {
    if (promptInputRef.current) {
      promptInputRef.current.submit();
    }
  };

  return conversation ? (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="line-clamp-2 whitespace-pre-wrap text-left leading-5">
            {t('page-conversation:section:set-system-message', {
              subject: conversation.subject,
            })}
          </DialogTitle>
          <DialogDescription className="whitespace-pre-wrap text-left">
            {t('page-conversation:message:set-system-message-tips')}
          </DialogDescription>
        </DialogHeader>
        <div>
          <FileUploaderContextProvider>
            <PromptInput
              ref={promptInputRef}
              enableUpload={false}
              enableSetting={false}
              enableOptions={false}
              showSendButton={false}
              onSubmit={onSubmit}
              defaultValue={message ? getTextFromMessage(message) : ''}
              conversation={conversation}
            />
          </FileUploaderContextProvider>
        </div>
        <DialogFooter className="gap-4">
          <Button variant="secondary" onClick={() => setShowDialog(false)}>
            {t('generic:action:cancel')}
          </Button>
          <Button onClick={onClick}>{t('generic:action:set')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;
});
