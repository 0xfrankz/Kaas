import { Pencil1Icon } from '@radix-ui/react-icons';
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

type THoverContext = {
  hover: boolean;
};

const HoverContext = createContext<THoverContext>({
  hover: false,
});

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

const MetaBar = () => {
  return (
    <div
      className={cn(
        'flex h-6 items-center justify-end text-xs font-medium text-slate-500'
      )}
    >
      <span>2:45 PM</span>
    </div>
  );
};

const Content = ({ content, rightAlign = false }: ContentProps) => {
  return (
    <div
      className={cn(
        'mt-2 text-base text-slate-900 flex',
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
        <MetaBar />
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
    <div className="box-border flex w-auto justify-start rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <LoadingIcon className="h-6" />
    </div>
  );
};

export default {
  User,
  Bot,
  System,
  BotLoading,
};
