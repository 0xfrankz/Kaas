/* eslint-disable react/prop-types */
import React from 'react';

import { cn } from '@/lib/utils';

const Root = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn('flex flex-col size-full', className)}
    ref={ref}
    {...props}
  />
));
Root.displayName = 'TwoRows.Root';

const Top = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn('h-fit w-full', className)} ref={ref} {...props} />
));
Top.displayName = 'TwoRows.Top';

const Bottom = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn('grow', className)} ref={ref} {...props} />
));
Bottom.displayName = 'TwoRows.Bottom';

export default { Root, Top, Bottom };
