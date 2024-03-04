import { ChatBubbleIcon, FileTextIcon, GearIcon } from '@radix-ui/react-icons';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { ModelIcon } from './ui/icons/ModelIcon';

type MenuProps = {
  expanded: boolean;
  // onConversationClick: () => void;
  // onTemplatesClick: () => void;
  // onModelsClick: () => void;
  // onSettingsClick: () => void;
};

type MenuItemProps = {
  text: string;
  to: string;
  icon: React.ReactNode;
  expanded: boolean;
  active: boolean;
  // onClick: () => void;
  className?: string;
};

function SideNavMenuItem({
  text,
  to,
  icon,
  expanded,
  active,
  // onClick,
  className: extraClassName = '',
}: MenuItemProps) {
  return (
    <Button
      className={cn(
        'flex text-base font-bold mx-auto rounded-2xl mb-4 h-12 cursor-pointer items-start justify-start bg-white hover:bg-gray-200 text-slate-900 shadow-none',
        expanded ? 'w-72' : 'w-12',
        active ? 'bg-[#F9FFB8]' : '',
        extraClassName
      )}
      title={text}
      type="button"
      asChild
    >
      <Link to={to}>
        <span className="my-auto">{icon}</span>
        {expanded ? <span className="my-auto ml-4">{text}</span> : null}
      </Link>
    </Button>
  );
}

export function SideNavMenu({
  expanded = false,
  // onConversationClick,
  // onTemplatesClick,
  // onModelsClick,
  // onSettingsClick,
}: MenuProps) {
  const { pathname } = useLocation();

  return (
    <ul
      className={cn(
        'grow flex flex-col justify-start',
        expanded ? 'mt-24' : 'mt-32'
      )}
    >
      <SideNavMenuItem
        text="Conversations"
        icon={<ChatBubbleIcon className="size-4" />}
        expanded={expanded}
        active={pathname === '/conversations'}
        to="/conversations"
        // onClick={() => {
        //   setActiveIndex(0);
        //   onConversationClick();
        // }}
      />
      <SideNavMenuItem
        text="Manage templates"
        icon={<FileTextIcon className="size-4" />}
        expanded={expanded}
        active={pathname === '/templates'}
        to="/templates"
        // onClick={() => {
        //   setActiveIndex(1);
        //   onTemplatesClick();
        // }}
      />
      <SideNavMenuItem
        text="Manage Models"
        icon={<ModelIcon className="stroke-slate-900 stroke-1" />}
        expanded={expanded}
        active={pathname === '/models'}
        to="/models"
        // onClick={() => {
        //   setActiveIndex(2);
        //   onModelsClick();
        // }}
      />
      <SideNavMenuItem
        text="Settings"
        icon={<GearIcon className="size-4" />}
        expanded={expanded}
        active={pathname === '/settings'}
        className="mt-auto"
        to="/settings"
        // onClick={() => {
        //   setActiveIndex(3);
        //   onSettingsClick();
        // }}
      />
    </ul>
  );
}
