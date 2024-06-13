import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { produce } from 'immer';
import {
  Bot as BotIcon,
  CircleAlert,
  RefreshCw,
  RotateCw,
  SquarePen,
  UserRound,
} from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_PROFILE_NAME,
  SETTING_PROFILE_NAME,
} from '@/lib/constants';
import {
  LIST_MESSAGES_KEY,
  useMessageCreator,
  useMessageListContext,
  useMessageListener,
  useMessageUpdater,
} from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import type { ContentItemList, Message } from '@/lib/types';
import {
  buildTextContent,
  cn,
  getMessageTag,
  getTextFromContent,
  getTextFromMessage,
} from '@/lib/utils';

import { ImagePreviwer } from './ImageUploader';
import { Button } from './ui/button';
import { LoadingIcon } from './ui/icons/LoadingIcon';

type WrapperProps = {
  children: React.ReactNode;
};

type MessageProps = {
  message: Message;
};

type ContentProps = {
  content: ContentItemList;
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

const MarkdownContent = ({ content }: ContentProps) => {
  return (
    <div className={cn('mt-2 prose max-w-none text-foreground')}>
      <Markdown remarkPlugins={[remarkGfm]}>
        {getTextFromContent(content)}
      </Markdown>
    </div>
  );
};

const ErrorContent = ({ error }: { error: string }) => {
  return (
    <div className="prose mt-2 flex max-w-none gap-2 text-red-600">{error}</div>
  );
};

const Content = ({ content }: ContentProps) => {
  const imageDataList = content.items
    .filter((item) => item.type === 'image')
    .map((image, index) => ({
      name: `image-${index}`,
      dataUrl: image.data,
    }));
  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          'mt-2 prose max-w-none text-foreground whitespace-pre-wrap'
        )}
      >
        {getTextFromContent(content)}
      </div>
      <ImagePreviwer dataList={imageDataList} />
    </div>
  );
};

const ActionBar = () => {
  const { hover } = useContext(HoverContext);
  return (
    <div className="mt-4 flex h-[14px] justify-end text-muted-foreground">
      <div className={cn(hover ? null : 'hidden')}>
        <SquarePen className="size-[14px]" />
      </div>
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
  onRegenerateClick,
}: {
  onRegenerateClick: () => void;
}) => {
  const { hover } = useContext(HoverContext);
  const { t } = useTranslation();
  return (
    <div className="mt-4 flex h-[14px] justify-end text-muted-foreground">
      <Button
        variant="ghost"
        className={cn(
          'flex gap-1 px-2 py-1 h-fit text-sm',
          hover ? null : 'hidden'
        )}
        onClick={onRegenerateClick}
      >
        <RefreshCw className="size-[14px]" />
        {t('generic:action:regenerate')}
      </Button>
    </div>
  );
};

const ContentReceiver = ({ message }: { message: Message }) => {
  const tag = getMessageTag(message);
  const { ready, receiving, message: msgStr, error } = useMessageListener(tag);
  const { onReceiverReady } = useMessageListContext();
  const creator = useMessageCreator();
  const updater = useMessageUpdater();
  const queryClient = useQueryClient();

  const renderContent = () => {
    // if (hasError) {
    //   return <ErrorContent error={error} />;
    // }
    if (msgStr.length > 0) {
      return <MarkdownContent content={buildTextContent(msgStr)} />;
    }
    return <LoadingIcon className="mt-2 h-6 self-start" />;
  };

  useEffect(() => {
    // When bot's reply is fully received
    // create or update message here
    if (!receiving && msgStr.length > 0) {
      message.content = buildTextContent(msgStr);
      if (message.id < 0) {
        // new message
        creator({
          conversationId: message.conversationId,
          role: message.role,
          content: message.content,
        });
      } else {
        updater(message);
      }
    }
  }, [creator, message, msgStr, receiving, updater]);

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
  console.log('User message:', message);
  const userName = useAppStateStore(
    (state) => state.settings[SETTING_PROFILE_NAME] ?? DEFAULT_PROFILE_NAME
  );
  return (
    <HoverContextProvider>
      <div className="flex w-auto flex-col rounded-2xl px-6 py-12">
        <MetaBar
          avatar={USER_AVATAR}
          name={userName}
          time={dayjs(message.createdAt).format(DEFAULT_DATETIME_FORMAT)}
        />
        <Content content={message.content} />
      </div>
    </HoverContextProvider>
  );
};

const Bot = ({ message }: MessageProps) => {
  const model = useAppStateStore((state) =>
    state.models.find((m) => m.id === message.modelId)
  );
  const { t } = useTranslation(['generic']);
  const { onRegenerateClick } = useMessageListContext();

  const renderContent = () => {
    if (message.isError) {
      return <ErrorContent error={getTextFromMessage(message)} />;
    }
    if (message.isReceiving) {
      return <ContentReceiver message={message} />;
    }
    return <MarkdownContent content={message.content} />;
  };

  return (
    <HoverContextProvider>
      <div className="box-border flex w-auto flex-col rounded-2xl bg-[--gray-a2] p-6 shadow">
        <MetaBar
          avatar={message.isError ? BOT_AVATAR_WITH_ERROR : BOT_AVATAR}
          name={model ? `${model.provider}` : t('generic:model:unknown')}
          time={dayjs(message.createdAt).format(DEFAULT_DATETIME_FORMAT)}
        />
        {renderContent()}
        {message.isError ? (
          <ErrorActionBar
            onRegenerateClick={() => onRegenerateClick(message)}
          />
        ) : (
          <BotActionBar onRegenerateClick={() => onRegenerateClick(message)} />
        )}
      </div>
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
