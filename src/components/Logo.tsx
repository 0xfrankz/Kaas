import React from 'react';
import { Link } from 'react-router-dom';

import logoTxt from '@/assets/images/kaas.svg';
import logoImg from '@/assets/images/logo.svg';
import { cn } from '@/lib/utils';

export interface Props {
  expanded?: boolean;
}

export function Logo({ expanded = false }: Props) {
  return (
    <div
      className={cn(
        'flex overflow-hidden w-24',
        expanded ? 'max-w-24' : 'max-w-6'
      )}
    >
      <Link to="/" className="flex h-6 w-full gap-2">
        <img src={logoImg} alt="Kaas" />
        <img src={logoTxt} alt="Kaas" />
      </Link>
    </div>
  );
}
