import { Pencil1Icon, PersonIcon } from '@radix-ui/react-icons';
import dayjs from 'dayjs';
import { createContext, useContext, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { DEFAULT_DATETIME_FORMAT } from '@/lib/constants';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

import { LoadingIcon } from './ui/icons/LoadingIcon';

type WrapperProps = {
  children: React.ReactNode;
};

type MessageProps = {
  message: Message;
};

type ContentProps = {
  content: string;
  rightAlign: boolean;
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
  <PersonIcon className="box-border size-6 rounded-full bg-slate-100 p-1" />
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

const Content = ({ content, rightAlign = false }: ContentProps) => {
  return (
    <div
      className={cn(
        'mt-2 prose prose-sm text-foreground',
        rightAlign ? 'text-right' : 'text-left'
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
};

const ActionBar = () => {
  const { hover } = useContext(HoverContext);
  return (
    <div className="mt-4 flex h-[14px] justify-end text-muted-foreground">
      <div className={cn(hover ? null : 'hidden')}>
        <Pencil1Icon className="size-[14px]" />
      </div>
    </div>
  );
};

const User = ({ message }: MessageProps) => {
  return (
    <HoverContextProvider>
      <div className="flex w-auto flex-col rounded-2xl p-6">
        <MetaBar
          time={dayjs(message.createdAt).format(DEFAULT_DATETIME_FORMAT)}
        />
        <Content content={message.content} rightAlign />
        <ActionBar />
      </div>
    </HoverContextProvider>
  );
};

const Bot = ({ message }: MessageProps) => {
  return (
    <HoverContextProvider>
      <div className="box-border flex w-auto flex-col rounded-2xl bg-[--gray-a2] p-6 shadow">
        <MetaBar
          avatar={BOT_AVATAR}
          name="Azure | gpt-3.5"
          time={dayjs(message.createdAt).format(DEFAULT_DATETIME_FORMAT)}
        />
        <Content content={message.content} rightAlign={false} />
        <ActionBar />
      </div>
    </HoverContextProvider>
  );
};

const BotReceiving = ({ message }: { message: string }) => {
  return (
    <div className="box-border flex w-auto flex-col rounded-2xl bg-[--gray-a2] p-6 shadow">
      <MetaBar avatar={BOT_AVATAR} name="Azure | gpt-3.5" />
      <Content content={message} rightAlign={false} />
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

const BotLoading = () => {
  return (
    <div className="box-border flex w-auto flex-col rounded-2xl bg-[--gray-a2] p-6 shadow">
      <MetaBar avatar={BOT_AVATAR} name="Azure | gpt-3.5" />
      <LoadingIcon className="mt-2 h-6 self-start" />
    </div>
  );
};

export default {
  User,
  Bot,
  System,
  BotLoading,
  BotReceiving,
};
