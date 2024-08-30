import type { MutableRefObject, TextareaHTMLAttributes } from 'react';
import { forwardRef, useCallback, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import { TextAreaWithMenu } from './TextareaWithMenu';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  maxHeight: number;
};

export const AutoFitTextarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ maxHeight, className, ...props }, ref) => {
    const taRef: MutableRefObject<HTMLTextAreaElement | null> = useRef(null);
    // Callbacks
    const fitHeight = useCallback(() => {
      const ta = taRef.current;
      if (!ta) return;
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
    }, [maxHeight]);

    useEffect(() => {
      fitHeight();
    }, [fitHeight]);

    return (
      <TextAreaWithMenu
        ref={(el) => {
          if (ref) {
            if (typeof ref === 'function') {
              ref(el);
            } else {
              ref.current = el;
            }
          }
          taRef.current = el;
        }}
        className={cn('resize-none overflow-y-hidden border px-2', className)}
        {...props}
        onChange={fitHeight}
      />
    );
  }
);
