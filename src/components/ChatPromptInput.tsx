import { useQueryClient } from '@tanstack/react-query';
import { ImagePlus, SendHorizonal } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  CONTENT_ITEM_TYPE_IMAGE,
  CONTENT_ITEM_TYPE_TEXT,
  MESSAGE_BOT,
  MESSAGE_USER,
  SETTING_USER_ENTER_TO_SEND,
} from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useMessageCreator,
  useSettingUpserter,
} from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import type {
  ContentItemTypes,
  ImageUploaderHandler,
  Message,
} from '@/lib/types';
import { cn } from '@/lib/utils';

import { ImageUploader } from './ImageUploader';
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
  const uploaderRef = useRef<ImageUploaderHandler>(null);
  const queryClient = useQueryClient();
  const creator = useMessageCreator({
    onSettled: () => {
      // insert placeholder to trigger generation
      const placeholder = {
        conversationId,
        role: MESSAGE_BOT,
        content: { items: [] },
        id: -1,
        isReceiving: true,
      };

      // add placeholder message
      queryClient.setQueryData<Message[]>(
        [
          ...LIST_MESSAGES_KEY,
          {
            conversationId,
          },
        ],
        (old) => {
          return old ? [...old, placeholder] : [placeholder];
        }
      );
    },
  });
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

  const onClick = useCallback(() => {
    const promptStr = promptRef.current?.value ?? '';
    if (promptStr.trim().length === 0) {
      toast.error(t('error:validation:empty-prompt'));
    } else {
      const images = uploaderRef.current?.getImageDataList() ?? [];
      const content = {
        items: [
          {
            type: CONTENT_ITEM_TYPE_TEXT as ContentItemTypes,
            data: promptStr,
          },
          ...images.map((image) => ({
            type: CONTENT_ITEM_TYPE_IMAGE as ContentItemTypes,
            data: image.dataUrl ?? '',
          })),
        ],
      };
      creator({
        conversationId,
        role: MESSAGE_USER,
        content,
      });
      if (promptRef.current) {
        promptRef.current.value = '';
      }
    }
  }, [conversationId, creator, t]);

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
    [enterToSend, onClick]
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
          'mb-2 flex min-h-15 w-full items-end rounded-xl px-2 py-3 text-sm gap-2',
          focused ? 'shadow-yellow-border-2' : 'shadow-gray-border-1'
        )}
      >
        <Button className="size-9 rounded-full p-0" variant="secondary">
          <ImagePlus className="size-4" />
        </Button>
        <div className="my-auto grow">
          <Textarea
            placeholder={t('page-conversation:message:input-placeholder')}
            className="no-scrollbar resize-none overflow-y-hidden border-0 px-2"
            rows={1}
            onChange={onChange}
            ref={promptRef}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        <Button onClick={onClick} className="size-9 rounded-full p-0">
          <SendHorizonal className="size-4" />
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
      <DndProvider backend={HTML5Backend}>
        <ImageUploader ref={uploaderRef} />
      </DndProvider>
    </>
  );
}
