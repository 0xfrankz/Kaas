import React from 'react';
import { Link } from 'react-router-dom';

import logoImg from '@/assets/images/logo.svg';

export interface Props {
  expanded?: boolean;
}

export function Logo({ expanded = false }: Props) {
  const size = expanded ? 48 : 32;
  return (
    <>
      <img src={logoImg} alt="Kaas" width={size} height={size} />
      {expanded && (
        <span className="my-auto ml-4 font-medium">
          <Link to="/">Kaas</Link>
        </span>
      )}
    </>
  );
}
