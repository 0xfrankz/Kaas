import { Pencil1Icon, PersonIcon } from '@radix-ui/react-icons';
import { createContext, useContext, useMemo, useState } from 'react';

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

const MetaBar = ({ avatar, name }: MetaBarProps) => {
  return (
    <div
      className={cn(
        'flex h-6 justify-normal items-center text-xs font-medium text-slate-500'
      )}
    >
      {avatar && name ? (
        <div className="flex items-center">
          {avatar}
          <span className="ml-2 font-medium text-slate-900">{name}</span>
        </div>
      ) : null}
      <div className="ml-auto">2:45 PM</div>
    </div>
  );
};

const Content = ({ content, rightAlign = false }: ContentProps) => {
  return (
    <div
      className={cn(
        'mt-2 text-sm text-slate-900 flex',
        rightAlign ? 'justify-end' : 'justify-start'
      )}
    >
      {content}
    </div>
  );
};

const ActionBar = () => {
  const { hover } = useContext(HoverContext);
  return (
    <div className="mt-4 flex h-[14px] justify-end text-slate-500">
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
        <MetaBar />
        <Content content={message.content} rightAlign />
        <ActionBar />
      </div>
    </HoverContextProvider>
  );
};

const Bot = ({ message }: MessageProps) => {
  return (
    <HoverContextProvider>
      <div className="box-border flex w-auto flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow">
        <MetaBar avatar={BOT_AVATAR} name="Azure | gpt-3.5" />
        <Content content={message.content} rightAlign={false} />
        <ActionBar />
      </div>
    </HoverContextProvider>
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
    <div className="box-border flex w-auto flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow">
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
};
