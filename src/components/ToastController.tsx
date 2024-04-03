import type { ForwardedRef } from 'react';
import { forwardRef, useImperativeHandle } from 'react';

import type { ToastHandler } from '@/lib/types';

import { useToast } from './ui/use-toast';

export const ToastController = forwardRef<ToastHandler, unknown>(
  (_props, ref: ForwardedRef<ToastHandler>) => {
    console.log('ToastController');
    const { toast } = useToast();
    useImperativeHandle(ref, () => ({
      showToast: (variant, title, description) => {
        toast({
          variant,
          title,
          description,
        });
      },
    }));
    return null;
  }
);
