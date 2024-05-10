import { Trash2 } from 'lucide-react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import { Button, type ButtonProps } from './ui/button';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

type DeleteButtonProps = ButtonProps & {
  message: string;
  onConfirm: () => void;
};

export const DeleteWithConfirmation = forwardRef<
  HTMLButtonElement,
  DeleteButtonProps
>(({ className, variant = 'ghost', message, onConfirm, ...props }, ref) => {
  const { t } = useTranslation();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          className={cn(
            'mr-auto text-red-600 hover:bg-red-100 hover:text-red-800',
            className
          )}
          {...props}
          ref={ref}
        >
          <Trash2 className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="whitespace-pre-wrap text-sm">{message}</div>
        <div className="mt-2 flex justify-center gap-2">
          <PopoverClose asChild>
            <Button variant="secondary">{t('generic:action:cancel')}</Button>
          </PopoverClose>
          <Button variant="destructive" onClick={onConfirm}>
            {t('generic:action:confirm')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});
