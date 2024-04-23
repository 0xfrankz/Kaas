import { PaperPlaneIcon } from '@radix-ui/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { MESSAGE_USER, SETTING_USER_ENTER_TO_SEND } from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useCreateMessageMutation,
  useSettingUpserter,
} from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';

const HEIGHT_LIMIT = 20 * 20;

type Props = {
  conversationId: number;
};

export function ChatPromptInput({ conversationId }: Props) {
  const [focused, setFocused] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const createMsgMutation = useCreateMessageMutation();
  const enterToSend = useAppStateStore(
    (state) => state.settings[SETTING_USER_ENTER_TO_SEND] !== 'false'
  );
  const upserter = useSettingUpserter();
  const { t } = useTranslation(['generic', 'page-conversation']);

  // Callbacks
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const ta = e.target as HTMLTextAreaElement;
    // Set overflowY to hidden and height to fit-content
    // so we can get a correct scrollHeight
    ta.style.overflowY = 'hidden';
    ta.style.height = 'fit-content';
    const { scrollHeight } = ta;
    if (scrollHeight > HEIGHT_LIMIT) {
      // Enable scroll when height limitation is reached
      ta.style.overflowY = 'scroll';
      ta.style.height = `${HEIGHT_LIMIT}px`;
    } else {
      // set overflowY back to hidden when height limitation is not reached
      ta.style.overflowY = 'hidden';
      // Set height to scrollHeight
      ta.style.height = `${scrollHeight}px`;
    }
  };

  const onClick = () => {
    const promptStr = promptRef.current?.value ?? '';
    if (promptStr.trim().length === 0) {
      toast.error(
        'You prompt is blank. Blank prompt is a waste of your tokens quota.'
      );
    } else {
      createMsgMutation.mutate(
        {
          conversationId,
          role: MESSAGE_USER,
          content: promptStr,
        },
        {
          onSuccess(message) {
            // Update cache
            queryClient.setQueryData<Message[]>(
              [...LIST_MESSAGES_KEY, { conversationId }],
              (messages) => (messages ? [...messages, message] : [message])
            );
          },
        }
      );
      if (promptRef.current) {
        promptRef.current.value = '';
      }
    }
  };

  const onCheckedChange = (checked: boolean) => {
    upserter({
      key: SETTING_USER_ENTER_TO_SEND,
      value: checked.toString(),
    });
  };

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (enterToSend && event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        onClick();
      }
      if (!enterToSend && event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        onClick();
      }
    },
    [enterToSend]
  );

  const onFocus = () => {
    setFocused(true);
  };

  const onBlur = () => {
    setFocused(false);
  };

  return (
    <>
      <div
        className={cn(
          'mb-2 flex min-h-15 w-full items-end rounded-xl px-2 py-3 text-sm',
          focused ? 'shadow-yellow-border-2' : 'shadow-gray-border-1'
        )}
      >
        <div className="my-auto grow">
          <Textarea
            placeholder="How can I help?"
            className="resize-none overflow-y-hidden border-0 px-2"
            rows={1}
            onChange={onChange}
            ref={promptRef}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        <Button onClick={onClick}>
          <PaperPlaneIcon />
        </Button>
      </div>
      <div className="mb-4 flex w-full items-center justify-between px-2 text-xs text-muted-foreground">
        <span>
          {enterToSend
            ? t('page-conversation:label:enter-to-send')
            : t('page-conversation:label:shift-enter-to-send')}
        </span>
        <div className="flex items-center">
          <span className="mr-2">
            {t('page-conversation:label:quick-send')}
          </span>
          <Switch checked={enterToSend} onCheckedChange={onCheckedChange} />
        </div>
      </div>
    </>
  );
}
