/* eslint-disable react/prop-types */
import React from 'react';

import { cn } from '@/lib/utils';

const TwoColumns = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn('flex size-full', className)} ref={ref} {...props} />
));
TwoColumns.displayName = 'TwoColumns';

const Left = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn('h-full w-fit', className)} ref={ref} {...props} />
));
Left.displayName = 'TwoColumns.Left';

const Right = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div className={cn('grow', className)} ref={ref} {...props} />
));
Right.displayName = 'TwoColumns.Right';

export default Object.assign(TwoColumns, { Left, Right });
