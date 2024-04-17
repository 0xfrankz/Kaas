import { ArchiveIcon, FileTextIcon, GearIcon } from '@radix-ui/react-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { ModelIcon } from './ui/icons/ModelIcon';

type MenuProps = {
  expanded: boolean;
};

type MenuItemProps = {
  text: string;
  to: string;
  icon: React.ReactNode;
  expanded: boolean;
  active: boolean;
  className?: string;
};

function SideNavMenuItem({
  text,
  to,
  icon,
  expanded,
  active,
  className: extraClassName = '',
}: MenuItemProps) {
  return (
    <Button
      className={cn(
        'flex text-base font-bold rounded-2xl mb-4 h-12 cursor-pointer items-start justify-start shadow-none hover:bg-[--gray-a4] active:bg-[--gray-a5] text-[--gray-11] hover:text-[--gray-11] transition-all overflow-hidden',
        expanded ? 'w-72 ml-4' : 'w-12 ml-2',
        active ? 'bg-[--gray-a3]' : 'bg-transparent',
        extraClassName
      )}
      title={text}
      variant="ghost"
      asChild
    >
      <Link to={to}>
        <span className="my-auto">{icon}</span>
        <span className={cn('my-auto ml-4')}>{text}</span>
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
        'grow flex flex-col justify-start items-start transition-[margin] mt-32'
      )}
    >
      <SideNavMenuItem
        text={t('nav.conversations')}
        icon={<ArchiveIcon className="size-4 text-foreground" />}
        expanded={expanded}
        active={pathname === '/conversations'}
        to="/conversations"
      />
      <SideNavMenuItem
        text={t('nav.templates')}
        icon={<FileTextIcon className="size-4 text-foreground" />}
        expanded={expanded}
        active={pathname === '/templates'}
        to="/templates"
      />
      <SideNavMenuItem
        text={t('nav.models')}
        icon={<ModelIcon className="stroke-foreground stroke-1" />}
        expanded={expanded}
        active={pathname === '/models'}
        to="/models"
      />
      <SideNavMenuItem
        text={t('nav.settings')}
        icon={<GearIcon className="size-4 text-foreground" />}
        expanded={expanded}
        active={pathname === '/settings'}
        className="mt-auto"
        to="/settings"
      />
    </ul>
  );
}
