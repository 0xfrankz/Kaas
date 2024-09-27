import { useTranslation } from 'react-i18next';

import { useConfirmationStateStore } from '@/lib/store';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export function ConfirmationDialog() {
  const { data, close } = useConfirmationStateStore();
  const { t } = useTranslation(['generic']);
  const onCancel = () => {
    if (data && data.onCancel) {
      data.onCancel();
    }
    close();
  };
  const onConfirm = () => {
    data?.onConfirm();
    close();
  };
  return (
    <AlertDialog open={data !== undefined}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{data?.title}</AlertDialogTitle>
          <AlertDialogDescription>{data?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {t('generic:action:cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('generic:action:confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
