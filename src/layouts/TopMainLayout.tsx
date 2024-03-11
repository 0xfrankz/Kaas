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
Root.displayName = 'TopMainLayout.Root';

const Top = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn('box-border h-16 w-full', className)}
    ref={ref}
    {...props}
  />
));
Top.displayName = 'TopMainLayout.Top';

const Main = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn('grow', className)} ref={ref} {...props} />
));
Main.displayName = 'TopMainLayout.Main';

export default { Root, Top, Main };
