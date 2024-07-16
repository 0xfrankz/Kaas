import type { HtmlHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { MAX_NUM_OF_UPLOAD_FILES } from '@/lib/constants';
import { useFileUploaderContext } from '@/lib/hooks';
import { cn } from '@/lib/utils';

export const ImageUploader = forwardRef<
  HTMLDivElement,
  HtmlHTMLAttributes<HTMLDivElement>
>(({ className }, ref) => {
  const { t } = useTranslation();
  const { files: pendingFiles, addFiles } = useFileUploaderContext();
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: File[] }) {
        const numOfSlotsLeft = Math.min(
          MAX_NUM_OF_UPLOAD_FILES - pendingFiles.length,
          item.files.length
        );
        for (let i = 0; i < numOfSlotsLeft; i += 1) {
          const file = item.files[i];
          const fr = new FileReader();
          fr.onload = () => {
            addFiles([
              {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileData: new Uint8Array(fr.result as ArrayBuffer),
              },
            ]);
          };
          fr.readAsArrayBuffer(file);
        }
        if (numOfSlotsLeft < item.files.length) {
          // show toast about max number of files allowed for upload
          toast.warning(
            t('generic:message:max-upload-files-warning', {
              maxNumOfUploadFiles: MAX_NUM_OF_UPLOAD_FILES,
            })
          );
        }
      },
      canDrop(item: { files: File[] }) {
        console.log('canDrop', item);
        const imgTypeReg = /^image\/(jpe?g|png|webp)$/;
        const typeCheck = item.files.every((file) =>
          imgTypeReg.test(file.type)
        );
        const sizeCheck = item.files.every(
          (file) => file.size < 1024 * 1024 * 20 // 20MB max per file
        );
        return typeCheck && sizeCheck;
      },
      collect: (monitor: DropTargetMonitor) => {
        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        };
      },
    }),
    [pendingFiles]
  );
  const isActive = canDrop && isOver;

  return (
    <div
      className={cn(
        'h-28 w-full overflow-hidden rounded-lg border border-dashed bg-subtle text-muted-foreground',
        isActive ? 'border-solid' : null,
        className
      )}
      ref={ref}
    >
      <div
        ref={drop}
        className="flex size-full items-center justify-center whitespace-pre-wrap text-center"
      >
        {isActive
          ? t('generic:message:release-to-upload')
          : t('generic:message:drag-file-here', {
              maxNumOfUploadFiles: MAX_NUM_OF_UPLOAD_FILES,
            })}
      </div>
    </div>
  );
});
