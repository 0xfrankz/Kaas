import { ImagePlus, Puzzle, SendHorizonal, Settings2, X } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';

import cache from '@/lib/cache';
import {
  CONTENT_ITEM_TYPE_IMAGE,
  CONTENT_ITEM_TYPE_TEXT,
  SETTING_USER_ENTER_TO_SEND,
} from '@/lib/constants';
import { useFileUploaderContext, useSettingUpserter } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import type {
  ContentItem,
  ContentItemTypes,
  ConversationDetails,
  DialogHandler,
  PromptInputHandler,
} from '@/lib/types';
import { cn, getFileExt } from '@/lib/utils';

import { AutoFitTextarea } from './AutoFitTextarea';
import { ConversationOptionsDialog } from './ConversationOptionsDialog';
import { ImagePreviwer } from './ImagePreviewer';
import { ImageUploader } from './ImageUploader';
import { PromptApplyDialog } from './PromptApplyDialog';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';

type Props = {
  enableUpload?: boolean;
  enablePromptTemplate?: boolean;
  enableSetting?: boolean;
  enableOptions?: boolean;
  showSendButton?: boolean;
  maxHeight?: number;
  defaultValue?: string;
  placeHolder?: string;
  conversation: ConversationDetails;
  onSubmit: (content: ContentItem[]) => void;
};

const MAX_HEIGHT = 20 * 20;
const PromptInput = forwardRef<PromptInputHandler, Props>(
  (
    {
      enableUpload = true,
      enablePromptTemplate = true,
      enableSetting = true,
      enableOptions = true,
      showSendButton = true,
      maxHeight = MAX_HEIGHT,
      defaultValue,
      placeHolder,
      conversation,
      onSubmit,
    },
    ref
  ) => {
    // States
    const [focused, setFocused] = useState(false);
    const [showDropZone, setShowDropZone] = useState(false);
    const { files, removeFile } = useFileUploaderContext();
    const enterToSend = useAppStateStore(
      (state) => state.settings[SETTING_USER_ENTER_TO_SEND] !== 'false'
    );
    const promptRef = useRef<HTMLTextAreaElement>(null);
    const promptGridDialogRef = useRef<DialogHandler<void>>(null);
    const optionsDialogRef = useRef<DialogHandler<void>>(null);
    const { t } = useTranslation(['generic', 'page-conversation']);

    // Queries
    const upserter = useSettingUpserter();

    // Callbacks
    const onUsePromptClick = useCallback(() => {
      promptGridDialogRef.current?.open();
    }, []);

    const onOpenOptionsClick = useCallback(() => {
      optionsDialogRef.current?.open();
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
      onSubmit(content);
      if (promptRef.current) {
        promptRef.current.value = '';
      }
    }, [files, onSubmit]);

    const onFocus = () => {
      setFocused(true);
    };

    const onBlur = () => {
      setFocused(false);
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

    const onCheckedChange = (checked: boolean) => {
      upserter({
        key: SETTING_USER_ENTER_TO_SEND,
        value: checked.toString(),
      });
    };

    useImperativeHandle(ref, () => ({
      submit: () => {
        onClick();
      },
    }));

    const onUseClick = (promptStr: string) => {
      if (promptRef.current) {
        const cursorPosition = promptRef.current.selectionStart;
        const textBeforeCursor = promptRef.current.value.substring(
          0,
          cursorPosition
        );
        const textAfterCursor =
          promptRef.current.value.substring(cursorPosition);
        // set value through native setter, so we can trigger onChange later
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement?.prototype,
          'value'
        )?.set;
        if (nativeInputValueSetter)
          nativeInputValueSetter.call(
            promptRef.current,
            `${textBeforeCursor}${promptStr}${textAfterCursor}`
          );
        promptGridDialogRef.current?.close(); // close dialog
        setTimeout(() => {
          if (promptRef.current) {
            promptRef.current.focus();
            // trigger onChange to fit height
            promptRef.current.dispatchEvent(
              new Event('change', { bubbles: true })
            );
            // set cursor to the end of newly inserted text
            promptRef.current.selectionStart =
              cursorPosition + promptStr.length;
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
            {enableUpload ? (
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
            ) : null}
            {enablePromptTemplate ? (
              <Button
                className="size-6 p-0"
                variant="secondary"
                onClick={onUsePromptClick}
              >
                <Puzzle className="size-[14px]" />
              </Button>
            ) : null}
            {enableOptions ? (
              <Button
                className="size-6 p-0"
                variant="secondary"
                onClick={onOpenOptionsClick}
              >
                <Settings2 className="size-4" />
              </Button>
            ) : null}
          </div>
          <div className="flex w-full">
            <div className="my-auto grow">
              <AutoFitTextarea
                maxHeight={maxHeight}
                placeholder={placeHolder}
                defaultValue={defaultValue}
                className="no-scrollbar resize-none overflow-y-hidden border-0 px-2"
                rows={1}
                ref={promptRef}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            {showSendButton ? (
              <Button onClick={onClick} className="size-9 rounded-full p-0">
                <SendHorizonal className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>
        {enableSetting ? (
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
        ) : null}
        <PromptApplyDialog ref={promptGridDialogRef} onUseClick={onUseClick} />
        <ConversationOptionsDialog
          ref={optionsDialogRef}
          conversation={conversation}
        />
      </>
    );
  }
);

export default PromptInput;
