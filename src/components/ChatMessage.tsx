import dayjs from 'dayjs';
import { Bot as BotIcon, RefreshCw, SquarePen, UserRound } from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_PROFILE_NAME,
  SETTING_PROFILE_NAME,
} from '@/lib/constants';
import { useMessageListContext, useMessageListener } from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import type { Message } from '@/lib/types';
import { cn, getMessageTag } from '@/lib/utils';

import { Button } from './ui/button';
import { LoadingIcon } from './ui/icons/LoadingIcon';

type WrapperProps = {
  children: React.ReactNode;
};

type MessageProps = {
  message: Message;
};

type BotMessageProps = MessageProps & {
  onRegenerateClick: () => void;
};

type ContentProps = {
  content: string;
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
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
};

const Content = ({ content }: ContentProps) => {
  return (
    <div
      className={cn(
        'mt-2 prose max-w-none text-foreground whitespace-pre-wrap'
      )}
    >
      {content}
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

const User = ({ message }: MessageProps) => {
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

const Bot = ({ message, onRegenerateClick }: BotMessageProps) => {
  const model = useAppStateStore((state) =>
    state.models.find((m) => m.id === message.modelId)
  );
  const { t } = useTranslation(['generic']);
  return (
    <HoverContextProvider>
      <div className="box-border flex w-auto flex-col rounded-2xl bg-[--gray-a2] p-6 shadow">
        <MetaBar
          avatar={BOT_AVATAR}
          name={model ? `${model.provider}` : t('generic:model:unknown')}
          time={dayjs(message.createdAt).format(DEFAULT_DATETIME_FORMAT)}
        />
        <MarkdownContent content={message.content} />
        <BotActionBar onRegenerateClick={onRegenerateClick} />
      </div>
    </HoverContextProvider>
  );
};

const BotReceiver = ({ message }: { message: Message }) => {
  const model = useAppStateStore((state) =>
    state.models.find((m) => m.id === message.modelId)
  );
  const { t } = useTranslation(['generic']);
  const tag = getMessageTag(message);
  const { ready, receiving, message: msgStr } = useMessageListener(tag);
  const { onMessageReceived, onReceiverReady } = useMessageListContext();
  useEffect(() => {
    if (!receiving && msgStr.length > 0) {
      message.content = msgStr;
      onMessageReceived(message);
    }
  }, [message, msgStr, onMessageReceived, receiving]);

  useEffect(() => {
    if (ready) {
      onReceiverReady();
    }
  }, [onReceiverReady, ready]);

  return (
    <div className="box-border flex w-auto flex-col rounded-2xl bg-[--gray-a2] p-6 shadow">
      <MetaBar
        avatar={BOT_AVATAR}
        name={model ? `${model.provider}` : t('generic:model:unknown')}
      />
      {msgStr.length > 0 ? (
        <MarkdownContent content={msgStr} />
      ) : (
        <LoadingIcon className="mt-2 h-6 self-start" />
      )}
    </div>
  );
};

const System = ({ message }: MessageProps) => {
  return (
    <div className="bg-gray-100">
      <div>{message.content}</div>
    </div>
  );
};

export default {
  User,
  Bot,
  System,
  BotReceiver,
};
