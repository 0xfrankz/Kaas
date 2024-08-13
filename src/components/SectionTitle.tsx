import React, { forwardRef } from 'react';

import { cn } from '@/lib/utils';

type SectionTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const SectionTitle = forwardRef<HTMLHeadingElement, SectionTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          'text-2xl font-semibold tracking-tight md:text-3xl',
          className
        )}
        {...props}
      >
        {children}
      </h2>
    );
  }
);

SectionTitle.displayName = 'SectionTitle';

export default SectionTitle;
