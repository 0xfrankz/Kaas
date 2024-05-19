import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

import { Textarea } from './ui/textarea';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  maxHeight?: number;
};

export const AutoFitTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ maxHeight = 400, className, onChange, ...props }, ref) => {
    // Callbacks
    const onValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const ta = e.target as HTMLTextAreaElement;
      // Set overflowY to hidden and height to fit-content
      // so we can get a correct scrollHeight
      ta.style.overflowY = 'hidden';
      ta.style.height = 'fit-content';
      const { scrollHeight } = ta;
      if (scrollHeight > maxHeight) {
        // Enable scroll when height limitation is reached
        ta.style.overflowY = 'scroll';
        ta.style.height = `${maxHeight}px`;
      } else {
        // set overflowY back to hidden when height limitation is not reached
        ta.style.overflowY = 'hidden';
        // Set height to scrollHeight
        ta.style.height = `${scrollHeight}px`;
      }
      // bubble up event
      onChange?.(e);
    };

    return (
      <Textarea
        ref={ref}
        className={cn('resize-none overflow-y-hidden border px-2', className)}
        {...props}
        onChange={onValueChange}
      />
    );
  }
);
