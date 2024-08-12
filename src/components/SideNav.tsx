import { useHover } from 'ahooks';
import React, { useRef } from 'react';

import { cn } from '@/lib/utils';

import { Logo } from './Logo';
import { SideNavMenu } from './SideNavMenu';

export function SideNav() {
  const ref = useRef(null);
  const isHovering = useHover(ref);

  return (
    <div className="flex-none md:relative md:min-h-full md:w-16">
      <div
        className={cn(
          'absolute top-0 left-0 flex flex-col box-border z-50 transition-[width] overflow-hidden pt-5',
          isHovering
            ? 'w-80 h-screen border-r border-border bg-background/70 backdrop-blur-lg'
            : 'size-16 md:w-16 md:h-screen md:border-r md:border-border',
          'md:bg-background/70 md:backdrop-blur-lg'
        )}
        ref={ref}
      >
        <Logo expanded={isHovering} />
        <SideNavMenu expanded={isHovering} />
      </div>
    </div>
  );
}
