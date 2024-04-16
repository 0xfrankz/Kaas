import { useHover } from '@uidotdev/usehooks';
import React from 'react';

import { cn } from '@/lib/utils';

import { Logo } from './Logo';
import { SideNavMenu } from './SideNavMenu';

export function SideNav() {
  const [ref, hovering] = useHover();

  // render functions
  const renderPlaceHolder = () => {
    // render an empty placeholder that has the same dimensions as SideNav
    return <div className="size-full" />;
  };

  return (
    <div className="relative min-h-full w-16">
      {renderPlaceHolder()}
      <div
        className={cn(
          'absolute top-0 left-0 h-screen flex flex-col box-border border-r border-border z-50 bg-background/80 backdrop-blur transition-[width]',
          hovering ? 'w-80' : 'w-16'
        )}
        ref={ref}
      >
        <div className={cn('flex items-center', hovering ? 'm-6' : 'm-4')}>
          <Logo expanded={hovering} />
        </div>
        <SideNavMenu expanded={hovering} />
      </div>
    </div>
  );
}
