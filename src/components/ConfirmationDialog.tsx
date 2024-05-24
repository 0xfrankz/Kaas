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
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
