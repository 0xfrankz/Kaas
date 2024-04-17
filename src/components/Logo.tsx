import React from 'react';
import { Link } from 'react-router-dom';

import logoImg from '@/assets/images/logo.svg';
import { cn } from '@/lib/utils';

export interface Props {
  expanded?: boolean;
}

export function Logo({ expanded = false }: Props) {
  return (
    <div
      className={cn(
        'flex transition-all overflow-hidden mt-4',
        expanded ? 'w-64 ml-8' : 'w-8 ml-4'
      )}
    >
      <Link to="/" className="flex">
        <img
          src={logoImg}
          alt="Kaas"
          width={32}
          height={32}
          className="hover:animate-spin-once"
        />
        <span className="my-auto ml-4 font-medium">Kaas</span>
      </Link>
    </div>
  );
}
