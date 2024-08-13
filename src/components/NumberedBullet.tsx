import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

type NumberedBulletProps = React.HTMLAttributes<HTMLDivElement> & {
  number: number;
};

const NumberedBullet = forwardRef<HTMLDivElement, NumberedBulletProps>(
  ({ number, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded-full border-2 border-foreground text-sm',
          className
        )}
        {...props}
        ref={ref}
      >
        {number}
      </div>
    );
  }
);

NumberedBullet.displayName = 'NumberedBullet';

export default NumberedBullet;
