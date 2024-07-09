import { useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Puzzle, SendHorizonal, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import cache from '@/lib/cache';
import {
  CONTENT_ITEM_TYPE_IMAGE,
  CONTENT_ITEM_TYPE_TEXT,
  MESSAGE_BOT,
  MESSAGE_USER,
  SETTING_USER_ENTER_TO_SEND,
} from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useFileUploaderContext,
  useMessageCreator,
  useSettingUpserter,
} from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import type {
  ContentItem,
  ContentItemTypes,
  DialogHandler,
  Message,
} from '@/lib/types';
import { cn, getFileExt } from '@/lib/utils';

import { ImagePreviwer } from './ImagePreviewer';
import { ImageUploader } from './ImageUploader';
import { PromptApplyDialog } from './PromptApplyDialog';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';

const HEIGHT_LIMIT = 20 * 20;

type Props = {
  conversationId: number;
};

export function ChatPromptInput({ conversationId }: Props) {
  const [focused, setFocused] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);
  const { files, removeFile } = useFileUploaderContext();
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const promptGridDialogRef = useRef<DialogHandler<void>>(null);
  const queryClient = useQueryClient();
  const creator = useMessageCreator({
    onSettled: (_, error) => {
      if (error) {
        toast.error(error.message);
      } else {
        // insert placeholder to trigger generation
        const placeholder: Message = {
          conversationId,
          role: MESSAGE_BOT,
          content: [],
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
      }
    },
  });
  const enterToSend = useAppStateStore(
    (state) => state.settings[SETTING_USER_ENTER_TO_SEND] !== 'false'
  );
  const upserter = useSettingUpserter();
  const { t } = useTranslation(['generic', 'page-conversation']);

  // Callbacks
  const fitTextareaHeight = useCallback(() => {
    if (promptRef.current) {
      const ta = promptRef.current;
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
    }
  }, []);

  const onClick = useCallback(async () => {
    // Save files to cache
    const tasks = files.map(async (file, index) => {
      const filename = `${Date.now()}-${index}.${getFileExt(file.fileName)}`;
      await cache.write(filename, file.fileData);
      file.fileName = filename;
    });
    await Promise.all(tasks);

    const promptStr = promptRef.current?.value ?? '';
    if (promptStr.trim().length === 0) {
      toast.error(t('error:validation:empty-prompt'));
    } else {
      const content: ContentItem[] = [
        {
          type: CONTENT_ITEM_TYPE_TEXT as ContentItemTypes,
          data: promptStr,
        },
        ...files.map((file) => ({
          type: CONTENT_ITEM_TYPE_IMAGE as ContentItemTypes,
          mimetype: file.fileType,
          data: file.fileName,
        })),
      ];
      creator({
        conversationId,
        role: MESSAGE_USER,
        content,
      });
      if (promptRef.current) {
        promptRef.current.value = '';
      }
    }
  }, [conversationId, creator, files, t]);

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

  const onUsePromptClick = useCallback(() => {
    promptGridDialogRef.current?.open();
  }, []);

  const onFocus = () => {
    setFocused(true);
  };

  const onBlur = () => {
    setFocused(false);
  };

  const onUseClick = (promptStr: string) => {
    if (promptRef.current) {
      const cursorPosition = promptRef.current.selectionStart;
      const textBeforeCursor = promptRef.current.value.substring(
        0,
        cursorPosition
      );
      const textAfterCursor = promptRef.current.value.substring(cursorPosition); // 光标之后的文本
      promptRef.current.value = `${textBeforeCursor}${promptStr}${textAfterCursor}`;
      promptGridDialogRef.current?.close(); // close dialog
      setTimeout(() => {
        if (promptRef.current) {
          fitTextareaHeight();
          promptRef.current.focus();
          // set cursor to the end of newly inserted text
          promptRef.current.selectionStart = cursorPosition + promptStr.length;
          promptRef.current.selectionEnd = cursorPosition + promptStr.length;
        }
      }, 200);
    }
  };

  return (
    <>
      <div
        className={cn(
          'mb-2 flex flex-col min-h-15 w-full items-end rounded-xl px-2 py-3 text-sm gap-2',
          focused ? 'shadow-yellow-border-2' : 'shadow-gray-border-1'
        )}
      >
        {files.length > 0 ? (
          <ImagePreviwer
            files={files}
            deletable
            onDelete={(index) => {
              removeFile(index);
            }}
          />
        ) : null}
        <DndProvider backend={HTML5Backend}>
          {showDropZone ? <ImageUploader className="mt-2" /> : null}
        </DndProvider>
        {files.length > 0 ? <Separator className="my-2" /> : null}
        <div className="flex w-full gap-2 px-2">
          <Button
            className="size-6 p-0"
            variant="secondary"
            onClick={() => setShowDropZone((state) => !state)}
          >
            {showDropZone ? (
              <X className="size-[14px]" />
            ) : (
              <ImagePlus className="size-[14px]" />
            )}
          </Button>
          <Button
            className="size-6 p-0"
            variant="secondary"
            onClick={onUsePromptClick}
          >
            <Puzzle className="size-[14px]" />
          </Button>
        </div>
        <div className="flex w-full">
          <div className="my-auto grow">
            <Textarea
              placeholder={t('page-conversation:message:input-placeholder')}
              className="no-scrollbar resize-none overflow-y-hidden border-0 px-2"
              rows={1}
              onChange={fitTextareaHeight}
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
      <PromptApplyDialog ref={promptGridDialogRef} onUseClick={onUseClick} />
    </>
  );
}
