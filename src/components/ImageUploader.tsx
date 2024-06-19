import type { HtmlHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';

import { useFileUploaderContext } from '@/lib/hooks';
import { cn } from '@/lib/utils';

export const ImageUploader = forwardRef<
  HTMLDivElement,
  HtmlHTMLAttributes<HTMLDivElement>
>(({ className }, ref) => {
  const { t } = useTranslation();
  const { addFiles } = useFileUploaderContext();
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop(item: { files: File[] }) {
      item.files.forEach((file) => {
        const fr = new FileReader();
        fr.onload = () => {
          addFiles([
            {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              fileLastModified: file.lastModified,
              fileData: new Uint8Array(fr.result as ArrayBuffer),
            },
          ]);
        };
        fr.readAsArrayBuffer(file);
      });
    },
    canDrop(item: { files: File[] }) {
      const imgTypeReg = /^image\/(jpe?g|png|webp)$/;
      const typeCheck = item.files.every((file) => imgTypeReg.test(file.type));
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
  }));
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
          : t('generic:message:drag-file-here')}
      </div>
    </div>
  );
});
