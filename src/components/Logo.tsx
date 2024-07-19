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
        'flex transition-all overflow-hidden mt-6',
        expanded ? 'w-64 ml-8' : 'w-8 ml-5'
      )}
    >
      <Link to="/" className="flex h-6 gap-2">
        <img src={logoImg} alt="Kaas" />
        <img src={logoTxt} alt="Kaas" />
      </Link>
    </div>
  );
}
