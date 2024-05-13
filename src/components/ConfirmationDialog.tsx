import { useConfirmationDialog } from '@/lib/hooks';

export function ConfirmationDialog() {
  console.log('ConfirmationDialog render');
  const { DialogEl } = useConfirmationDialog();
  return <DialogEl />;
}
