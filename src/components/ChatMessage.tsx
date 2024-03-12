import { Pencil1Icon } from '@radix-ui/react-icons';

import type { Message } from '@/lib/types';

type WrapperProps = {
  children: React.ReactNode;
};

type MessageProps = {
  message: Message;
};

type ContentProps = {
  content: string;
};

const MetaBar = () => {
  return (
    <div className="flex h-6 items-center justify-end text-xs font-medium text-slate-500">
      2:45 PM
    </div>
  );
};

const Content = ({ content }: ContentProps) => {
  return <div className="mt-2 text-base text-slate-900">{content}</div>;
};

const ActionBar = () => {
  return (
    <div className="mt-4 flex h-[14px] justify-end text-slate-500">
      <Pencil1Icon className="size-[14px]" />
    </div>
  );
};

const BotWrapper = ({ children }: WrapperProps) => {
  return (
    <div className="box-border flex w-auto flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow">
      {children}
    </div>
  );
};

const User = ({ message }: MessageProps) => {
  return (
    <div className="bg-green-100">
      <div>{message.content}</div>
    </div>
  );
};

const Bot = ({ message }: MessageProps) => {
  return (
    <BotWrapper>
      <MetaBar />
      <Content content={message.content} />
      <ActionBar />
    </BotWrapper>
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
};
