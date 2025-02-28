import 'katex/dist/katex.min.css'; // `rehype-katex` does not import the CSS for you

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { produce } from 'immer';
import {
  Bot as BotIcon,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  ClipboardCopy,
  Coins,
  RefreshCw,
  RotateCw,
  UserRound,
} from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExtraProps } from 'react-markdown';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark as highlighterTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import cache from '@/lib/cache';
import {
  CONTENT_ITEM_TYPE_IMAGE,
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_PROFILE_NAME,
  SETTING_PROFILE_NAME,
} from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useMessageCreator,
  useMessageListContext,
  useMessageUpdater,
  useReplyListener,
} from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import type { ContentItem, FileData, Message } from '@/lib/types';
import {
  buildTextContent,
  cn,
  getMessageTag,
  getTextFromContent,
  getTextFromMessage,
  preprocessLaTeX,
} from '@/lib/utils';

import { CopyCode } from './CopyCode';
import { ImagePreviwer } from './ImagePreviewer';
import { Button } from './ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';
import { LoadingIcon } from './ui/icons/LoadingIcon';
import {
  Table as TableInner,
  TableBody as TableBodyInner,
  TableCaption as TableCaptionInner,
  TableCell as TableCellInner,
  TableFooter as TableFooterInner,
  TableHead as TableHeadInner,
  TableHeader as TableHeaderInner,
  TableRow as TableRowInner,
} from './ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type WrapperProps = {
  children: React.ReactNode;
};

type MessageProps = {
  message: Message;
};

type ContentProps = {
  content: ContentItem[];
};

type MetaBarProps = {
  avatar?: React.ReactNode;
  name?: string;
  time?: string;
};

type THoverContext = {
  hover: boolean;
};

const HoverContext = createContext<THoverContext>({
  hover: false,
});

const BOT_AVATAR = (
  <BotIcon className="box-border size-6 rounded-full border border-border-yellow stroke-foreground stroke-1 p-1" />
);

const BOT_AVATAR_WITH_ERROR = (
  <div className="relative size-fit">
    <BotIcon className="box-border size-6 rounded-full border border-red-500 stroke-foreground stroke-1 p-1" />
    <div className="absolute -right-2 -top-2 size-4 rounded-full bg-red-500 ">
      <CircleAlert className="size-full text-white" />
    </div>
  </div>
);

const USER_AVATAR = (
  <UserRound className="box-border size-6 rounded-full border border-border-yellow p-1" />
);

const HoverContextProvider = ({ children }: WrapperProps) => {
  const [hover, setHover] = useState(false);
  const context = useMemo(() => ({ hover }), [hover]);
  return (
    <div
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <HoverContext.Provider value={context}>{children}</HoverContext.Provider>
    </div>
  );
};

const MetaBar = ({ avatar, name, time }: MetaBarProps) => {
  return (
    <div
      className={cn(
        'flex h-6 justify-normal items-center text-xs font-medium text-muted-foreground'
      )}
    >
      {avatar && name ? (
        <div className="flex items-center">
          {avatar}
          <span className="ml-2 font-medium">{name}</span>
        </div>
      ) : null}
      {time ? <div className="ml-auto">{time}</div> : null}
    </div>
  );
};

const CodeHighlighter = ({
  children,
  node: _,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & ExtraProps) => {
  const match = /language-(\w+)/.exec(className || '');
  const childrenStr = String(children).replace(/\n$/, '');

  const onCopyClick = () => {
    navigator.clipboard.writeText(childrenStr);
  };

  return match ? (
    <div className="group relative">
      <SyntaxHighlighter
        {...props}
        // eslint-disable-next-line react/no-children-prop
        children={childrenStr}
        language={match[1]}
        style={highlighterTheme}
      />
      <CopyCode
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-80"
        onClick={onCopyClick}
      />
    </div>
  ) : (
    <code {...props} className={cn('text-wrap font-kaas italic', className)}>
      {children}
    </code>
  );
};

const Table = ({
  children,
  node: _,
  ...props
}: React.HTMLAttributes<HTMLTableElement> & ExtraProps) => {
  return <TableInner {...props}>{children}</TableInner>;
};

const TableHeader = ({
  children,
  node: _,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & ExtraProps) => {
  return <TableHeaderInner {...props}>{children}</TableHeaderInner>;
};

const TableBody = ({
  children,
  node: _,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & ExtraProps) => {
  return <TableBodyInner {...props}>{children}</TableBodyInner>;
};

const TableFooter = ({
  children,
  node: _,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & ExtraProps) => {
  return <TableFooterInner {...props}>{children}</TableFooterInner>;
};

const TableRow = ({
  children,
  node: _,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & ExtraProps) => {
  return <TableRowInner {...props}>{children}</TableRowInner>;
};

const TableHead = ({
  children,
  node: _,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement> & ExtraProps) => {
  return <TableHeadInner {...props}>{children}</TableHeadInner>;
};

const TableCell = ({
  children,
  node: _,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement> & ExtraProps) => {
  return <TableCellInner {...props}>{children}</TableCellInner>;
};

const TableCaption = ({
  children,
  node: _,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement> & ExtraProps) => {
  return <TableCaptionInner {...props}>{children}</TableCaptionInner>;
};

const MarkdownContent = ({ content }: ContentProps) => {
  return (
    <div className="prose mt-2 max-w-none select-text text-foreground prose-p:mb-6 prose-pre:mb-6 prose-ol:mb-6 prose-ol:list-decimal prose-ol:pl-6 prose-ul:mb-6 prose-ul:list-disc prose-ul:pl-6 prose-li:my-3">
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: CodeHighlighter,
          table: Table,
          thead: TableHeader,
          tbody: TableBody,
          tfoot: TableFooter,
          tr: TableRow,
          td: TableCell,
          th: TableHead,
          caption: TableCaption,
        }}
      >
        {preprocessLaTeX(getTextFromContent(content))}
      </Markdown>
    </div>
  );
};

const ErrorContent = ({ error }: { error: string }) => {
  return (
    <div className="prose mt-2 flex max-w-none select-text gap-2 text-red-600">
      {error}
    </div>
  );
};

const Content = ({ content }: ContentProps) => {
  const [images, setImages] = useState<FileData[]>([]);
  const imageItems = useMemo(
    () =>
      content.filter((item) => {
        return item.type === CONTENT_ITEM_TYPE_IMAGE;
      }),
    [content]
  );
  useEffect(() => {
    const tasks: Promise<FileData>[] = imageItems.map(async (item) => {
      const data = await cache.read(item.data);
      return {
        fileName: item.data,
        fileSize: 0,
        fileType: item.mimetype ?? 'image/jpeg',
        fileData: data,
      };
    });
    Promise.all(tasks).then((imageData) => setImages(imageData));
  }, [imageItems]);

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          'mt-2 prose max-w-none text-foreground whitespace-pre-wrap select-text'
        )}
      >
        {getTextFromContent(content)}
      </div>
      {imageItems.length > 0 ? (
        <ImagePreviwer files={images} deletable={false} onDelete={() => {}} />
      ) : null}
    </div>
  );
};

const UserActionBar = ({ onCopyClick }: { onCopyClick: () => void }) => {
  const { hover } = useContext(HoverContext);
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex h-[14px] items-center justify-end gap-6 text-muted-foreground">
      <Button
        variant="ghost"
        className={cn(
          'flex gap-1 px-2 py-1 h-fit text-xs',
          hover ? null : 'hidden'
        )}
        onClick={onCopyClick}
      >
        <ClipboardCopy className="size-[14px]" />
        {t('generic:action:copy')}
      </Button>
    </div>
  );
};

const ErrorActionBar = ({
  onRegenerateClick,
}: {
  onRegenerateClick: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex h-fit justify-end text-muted-foreground">
      <Button
        variant="secondary"
        className="flex gap-2"
        onClick={onRegenerateClick}
      >
        <RotateCw className="size-[14px]" />
        {t('generic:action:retry')}
      </Button>
    </div>
  );
};

const BotActionBar = ({
  usage,
  onRegenerateClick,
  onCopyClick,
}: {
  usage?: number;
  onRegenerateClick: () => void;
  onCopyClick: () => void;
}) => {
  const { hover } = useContext(HoverContext);
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex h-[14px] items-center justify-end gap-6 text-muted-foreground">
      <Button
        variant="ghost"
        className={cn(
          'flex gap-1 px-2 py-1 h-fit text-xs',
          hover ? null : 'hidden'
        )}
        onClick={onCopyClick}
      >
        <ClipboardCopy className="size-[14px]" />
        {t('generic:action:copy')}
      </Button>
      <Button
        variant="ghost"
        className={cn(
          'flex gap-1 px-2 py-1 h-fit text-xs',
          hover ? null : 'hidden'
        )}
        onClick={onRegenerateClick}
      >
        <RefreshCw className="size-[14px]" />
        {t('generic:action:regenerate')}
      </Button>
      {usage ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                hover ? null : 'hidden'
              )}
            >
              <Coins className="size-[14px]" />
              {usage}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <span>{t('page-conversation:message:token-usage', { usage })}</span>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
};

const ReasoningContent = ({
  reasoning,
  defaultShowReasoning = true,
}: {
  reasoning: string;
  defaultShowReasoning?: boolean;
}) => {
  const { t } = useTranslation();
  const [showReasoning, setShowReasoning] = useState(defaultShowReasoning);
  return (
    <div className="my-4">
      {showReasoning ? (
        <pre className="prose mb-2 max-w-none select-text text-wrap border-l-2 border-border pl-4 text-sm text-muted-foreground prose-p:mb-6 prose-pre:mb-6 prose-ol:mb-6 prose-ol:list-decimal prose-ol:pl-6 prose-ul:mb-6 prose-ul:list-disc prose-ul:pl-6 prose-li:my-3">
          {reasoning}
        </pre>
      ) : null}
      <Button
        variant="secondary"
        className="size-fit gap-2 rounded-full bg-muted text-xs text-muted-foreground shadow-none hover:bg-muted-hover"
        onClick={() => setShowReasoning(!showReasoning)}
      >
        {showReasoning ? (
          <>
            {t('generic:action:hide-reasoning')}{' '}
            <ChevronUp className="size-4" />
          </>
        ) : (
          <>
            {t('generic:action:show-reasoning')}{' '}
            <ChevronDown className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
};

const ContentReceiver = ({
  message,
  showReasoning = false,
}: {
  message: Message;
  showReasoning?: boolean;
}) => {
  const tag = getMessageTag(message);
  const { ready, receiving, reply, error } = useReplyListener(tag);
  const { onReceiverReady } = useMessageListContext();
  const creator = useMessageCreator();
  const updater = useMessageUpdater();
  const queryClient = useQueryClient();

  const renderContent = () => {
    if (reply && (reply.reasoning?.length ?? 0) + reply.message.length > 0) {
      return (
        <>
          {(reply.reasoning?.length ?? 0) > 0 && showReasoning ? (
            <ReasoningContent reasoning={(reply.reasoning ?? '').trim()} />
          ) : null}
          {reply.message.length > 0 ? (
            <MarkdownContent content={buildTextContent(reply.message)} />
          ) : null}
        </>
      );
    }
    // Show loading icon if the reply is not received and reasoning is not shown
    return <LoadingIcon className="mt-2 h-6 self-start" />;
  };

  useEffect(() => {
    // When bot's reply is fully received
    // create or update message here
    if (
      !receiving &&
      reply &&
      (reply.message.length > 0 || (reply.reasoning?.length ?? 0) > 0)
    ) {
      const content = buildTextContent(reply.message);
      if (message.id < 0) {
        // new message
        creator({
          conversationId: message.conversationId,
          role: message.role,
          content,
          reasoning: reply.reasoning,
          promptToken: reply.promptToken,
          completionToken: reply.completionToken,
          reasoningToken: reply.reasoningToken,
          totalToken: reply.totalToken,
        });
      } else {
        updater({
          ...message,
          content,
          reasoning: reply.reasoning,
          promptToken: reply.promptToken,
          completionToken: reply.completionToken,
          reasoningToken: reply.reasoningToken,
          totalToken: reply.totalToken,
        });
      }
    }
  }, [creator, message, reply, receiving, updater]);

  useEffect(() => {
    // handle BE errors
    if (error && error.length > 0) {
      queryClient.setQueryData<Message[]>(
        [...LIST_MESSAGES_KEY, { conversationId: message.conversationId }],
        (old) =>
          produce(old, (draft) => {
            const target = draft?.find((m) => m.id === message.id);
            if (target) {
              target.content = buildTextContent(error);
              target.isError = true;
              target.isReceiving = false;
            }
          })
      );
    }
  }, [error, message.conversationId, message.id, queryClient]);

  useEffect(() => {
    if (ready) {
      onReceiverReady();
    }
  }, [onReceiverReady, ready]);

  return renderContent();
};

const User = ({ message }: MessageProps) => {
  const { t } = useTranslation();
  const userName = useAppStateStore(
    (state) => state.settings[SETTING_PROFILE_NAME] ?? DEFAULT_PROFILE_NAME
  );

  const onCopyClick = () => {
    navigator.clipboard.writeText(getTextFromMessage(message));
  };

  return (
    <HoverContextProvider>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="flex w-auto flex-col rounded-2xl p-6">
            <MetaBar
              avatar={USER_AVATAR}
              name={userName}
              time={dayjs(message.createdAt).format(DEFAULT_DATETIME_FORMAT)}
            />
            <Content content={message.content} />
            <UserActionBar onCopyClick={onCopyClick} />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            className="cursor-pointer gap-2"
            onClick={onCopyClick}
          >
            <ClipboardCopy className="size-4" /> {t('generic:action:copy')}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </HoverContextProvider>
  );
};

const Bot = ({
  message,
  showReasoning = false,
}: MessageProps & { showReasoning?: boolean }) => {
  const model = useAppStateStore((state) =>
    state.models.find((m) => m.id === message.modelId)
  );
  const { t } = useTranslation(['generic']);
  const { onRegenerateClick } = useMessageListContext();

  const onCopyClick = () => {
    navigator.clipboard.writeText(getTextFromMessage(message));
  };

  const render = () => {
    if (message.isError) {
      return (
        <>
          <div className="box-border flex w-auto flex-col rounded-2xl bg-[--gray-a2] p-6 shadow">
            <MetaBar
              avatar={message.isError ? BOT_AVATAR_WITH_ERROR : BOT_AVATAR}
              name={model ? `${model.provider}` : t('generic:model:unknown')}
              time={dayjs(message.createdAt).format(DEFAULT_DATETIME_FORMAT)}
            />
            <ErrorContent error={getTextFromMessage(message)} />
          </div>
          <ErrorActionBar
            onRegenerateClick={() => onRegenerateClick(message)}
          />
        </>
      );
    }
    if (message.isReceiving) {
      return (
        <div className="box-border flex w-auto flex-col rounded-2xl bg-[--gray-a2] p-6 shadow">
          <MetaBar
            avatar={message.isError ? BOT_AVATAR_WITH_ERROR : BOT_AVATAR}
            name={model ? `${model.provider}` : t('generic:model:unknown')}
            time={dayjs(message.createdAt).format(DEFAULT_DATETIME_FORMAT)}
          />
          <ContentReceiver message={message} showReasoning={showReasoning} />
        </div>
      );
    }
    return (
      <>
        <div className="box-border flex w-auto flex-col rounded-2xl bg-[--gray-a2] p-6 shadow">
          <MetaBar
            avatar={message.isError ? BOT_AVATAR_WITH_ERROR : BOT_AVATAR}
            name={model ? `${model.provider}` : t('generic:model:unknown')}
            time={dayjs(message.createdAt).format(DEFAULT_DATETIME_FORMAT)}
          />
          {message.reasoning && showReasoning ? (
            <ReasoningContent reasoning={message.reasoning.trim()} />
          ) : null}
          <MarkdownContent content={message.content} />
        </div>
        <BotActionBar
          onRegenerateClick={() => onRegenerateClick(message)}
          onCopyClick={onCopyClick}
          usage={message.totalToken}
        />
      </>
    );
  };

  return (
    <HoverContextProvider>
      <ContextMenu>
        <ContextMenuTrigger>{render()}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            className="cursor-pointer gap-2"
            onClick={onCopyClick}
          >
            <ClipboardCopy className="size-4" /> {t('generic:action:copy')}
          </ContextMenuItem>
          <ContextMenuItem
            className="cursor-pointer gap-2"
            onClick={() => onRegenerateClick(message)}
          >
            <RefreshCw className="size-4" /> {t('generic:action:regenerate')}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </HoverContextProvider>
  );
};

const System = ({ message }: MessageProps) => {
  return (
    <div className="bg-gray-100">
      <div>{getTextFromMessage(message)}</div>
    </div>
  );
};

export default {
  User,
  Bot,
  System,
};
