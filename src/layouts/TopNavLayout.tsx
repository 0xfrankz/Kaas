/* eslint-disable react/prop-types */
import React from 'react';

import { cn } from '@/lib/utils';

const TopNavLayout = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn('flex flex-col size-full', className)}
    ref={ref}
    {...props}
  />
));
TopNavLayout.displayName = 'TopNavLayout';

export { TopNavLayout };
