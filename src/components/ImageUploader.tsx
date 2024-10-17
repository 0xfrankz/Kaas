import type { HtmlHTMLAttributes } from 'react';
import { forwardRef, useCallback, useRef } from 'react';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { Trans, useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { MAX_NUM_OF_UPLOAD_FILES } from '@/lib/constants';
import { useFileUploaderContext } from '@/lib/hooks';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';

export const ImageUploader = forwardRef<
  HTMLDivElement,
  HtmlHTMLAttributes<HTMLDivElement>
>(({ className }, ref) => {
  const { t } = useTranslation();
  const { files: pendingFiles, addFiles } = useFileUploaderContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processFiles = useCallback(
    (files: File[]) => {
      const numOfSlotsLeft = Math.min(
        MAX_NUM_OF_UPLOAD_FILES - pendingFiles.length,
        files.length
      );
      for (let i = 0; i < numOfSlotsLeft; i += 1) {
        const file = files[i];
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
      if (numOfSlotsLeft < files.length) {
        // show toast about max number of files allowed for upload
        toast.warning(
          t('generic:message:max-upload-files-warning', {
            maxNumOfUploadFiles: MAX_NUM_OF_UPLOAD_FILES,
          })
        );
      }
    },
    [addFiles, pendingFiles.length, t]
  );
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: File[] }) {
        processFiles(item.files);
      },
      canDrop(item: { files: File[] }) {
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
  console.log('canDrop', canDrop);
  console.log('isOver', isOver);
  console.log('isActive', isActive);

  const onBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      processFiles(files);
      e.target.value = '';
    },
    [processFiles]
  );

  return (
    <div
      className={cn(
        'h-28 w-full overflow-hidden rounded-lg border border-dashed bg-subtle text-muted-foreground flex flex-col items-center',
        isActive ? 'border-solid' : null,
        className
      )}
      ref={ref}
    >
      <div
        ref={drop}
        className="flex w-full grow items-center justify-center whitespace-pre-wrap text-center"
      >
        {isActive ? (
          t('generic:message:release-to-upload')
        ) : (
          <p className="leading-6">
            <Trans
              i18nKey="generic:message:drag-file-here"
              values={{ maxNumOfUploadFiles: MAX_NUM_OF_UPLOAD_FILES }}
              components={{
                browseButton: (
                  <Button
                    variant="link"
                    className="mx-1 inline h-fit p-0 leading-6"
                    onClick={onBrowseClick}
                  />
                ),
              }}
            />
          </p>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
    </div>
  );
});
