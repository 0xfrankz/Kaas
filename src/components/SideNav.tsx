import { useHover } from 'ahooks';
import React, { useRef } from 'react';

import { cn } from '@/lib/utils';

import { Logo } from './Logo';
import { SideNavMenu } from './SideNavMenu';

export function SideNav() {
  const ref = useRef(null);
  const isHovering = useHover(ref);

  return (
    <div className="relative min-h-full w-16">
      <div
        className={cn(
          'absolute top-0 left-0 h-screen flex flex-col box-border border-r border-border z-50 bg-background/70 backdrop-blur-lg transition-[width]',
          isHovering ? 'w-80' : 'w-16'
        )}
        ref={ref}
      >
        <Logo expanded={isHovering} />
        <SideNavMenu expanded={isHovering} />
      </div>
    </div>
  );
}
