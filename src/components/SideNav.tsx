import { useHover } from 'ahooks';
import React, { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Logo } from './Logo';
import { Pin } from './Pin';
import { SideNavMenu } from './SideNavMenu';

export function SideNav() {
  const [isPinned, setIsPinned] = useState(false);
  const ref = useRef(null);
  const isHovering = useHover(ref);
  // const isHovering = true;

  const isExpanded = isHovering || isPinned;
  // const isExpanded = true;

  return (
    // The placeholder is used to make the sidebar expand to its full width when pinned
    <div
      className={cn(
        'flex-none md:relative md:min-h-screen transition-[width]',
        isPinned ? 'md:w-80' : 'md:w-[72px]'
      )}
      id="side-nav-placeholder"
    >
      {/* The sidebar content */}
      <div
        className={cn(
          'flex absolute top-0 left-0 box-border z-50 transition-[width] overflow-hidden justify-between md:backdrop-blur-lg',
          'md:bg-background/70',
          isExpanded
            ? `${isPinned ? 'w-80' : 'w-80 md:w-[328px]'} h-screen bg-background/70 backdrop-blur-lg`
            : 'size-16 md:w-[72px] md:h-screen md:border-border',
          isPinned ? 'shadow-none' : 'md:shadow-lg'
        )}
        ref={ref}
        id="side-nav"
      >
        {/* The bordered inner wrapper */}
        <div
          className={cn(
            'box-border flex flex-col py-5 transition-[width] border-0 rounded-none',
            isExpanded ? 'w-80 border-r' : 'w-16',
            isPinned
              ? 'rounded-none border-r'
              : 'md:border md:rounded-lg md:my-1 md:ml-2 md:py-4'
          )}
          id="side-nav-inner"
        >
          {/* The top content */}
          <div
            className={cn(
              'flex box-border justify-between transition-[padding] w-72',
              isExpanded ? 'pl-7' : 'pl-5'
            )}
            id="side-nav-top"
          >
            <Logo expanded={isExpanded} />
            <Pin className="h-6 p-1" onPinnedChange={setIsPinned} />
          </div>
          {/* The menu content */}
          <SideNavMenu expanded={isExpanded} />
        </div>
      </div>
    </div>
  );
}
