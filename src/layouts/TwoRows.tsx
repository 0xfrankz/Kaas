/* eslint-disable react/prop-types */
import React from 'react';

import { cn } from '@/lib/utils';

const TwoRows = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn('flex flex-col', className)} ref={ref} {...props} />
));
TwoRows.displayName = 'TwoRows';

const Top = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn('h-fit', className)} ref={ref} {...props} />
));
Top.displayName = 'TwoRows.Top';

const Bottom = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn('grow', className)} ref={ref} {...props} />
));
Bottom.displayName = 'TwoRows.Bottom';

export default Object.assign(TwoRows, { Top, Bottom });
