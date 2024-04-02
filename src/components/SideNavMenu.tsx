import { ArchiveIcon, FileTextIcon, GearIcon } from '@radix-ui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
        'flex text-base font-bold mx-auto rounded-2xl mb-4 h-12 cursor-pointer items-start justify-start bg-white hover:bg-gray-50 text-slate-900 shadow-none',
        expanded ? 'w-72' : 'w-12',
        active ? 'bg-[#F9FFB8] hover:bg-[#F9FFB8]' : '',
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

export function SideNavMenu({ expanded = false }: MenuProps) {
  const { pathname } = useLocation();
  const { t } = useTranslation('generic');

  return (
    <ul
      className={cn(
        'grow flex flex-col justify-start',
        expanded ? 'mt-24' : 'mt-32'
      )}
    >
      <SideNavMenuItem
        text={t('nav.conversations')}
        icon={<ArchiveIcon className="size-4" />}
        expanded={expanded}
        active={pathname === '/conversations'}
        to="/conversations"
      />
      <SideNavMenuItem
        text={t('nav.templates')}
        icon={<FileTextIcon className="size-4" />}
        expanded={expanded}
        active={pathname === '/templates'}
        to="/templates"
      />
      <SideNavMenuItem
        text={t('nav.models')}
        icon={<ModelIcon className="stroke-slate-900 stroke-1" />}
        expanded={expanded}
        active={pathname === '/models'}
        to="/models"
      />
      <SideNavMenuItem
        text={t('nav.settings')}
        icon={<GearIcon className="size-4" />}
        expanded={expanded}
        active={pathname === '/settings'}
        className="mt-auto"
        to="/settings"
      />
    </ul>
  );
}
