import type { HtmlHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useTranslation } from 'react-i18next';

import { useFileUploaderContext } from '@/lib/hooks';
import { cn } from '@/lib/utils';

type ImageDropTargetProps = {
  onDrop: (files: File[]) => void;
};

function ImageDropTarget({ onDrop }: ImageDropTargetProps) {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop(item: { files: File[] }) {
      onDrop(item.files);
    },
    canDrop(item: { files: File[] }) {
      const imgTypeReg = /^image\/[\w]+$/;
      const allImages = item.files.every((file) => imgTypeReg.test(file.type));
      return allImages;
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
    <div ref={drop} className="size-full">
      {isActive ? 'Release to drop' : 'Drag file here'}
    </div>
  );
}

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
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              data: fr.result as string,
            },
          ]);
        };
        fr.readAsDataURL(file);
      });
    },
    canDrop(item: { files: File[] }) {
      const imgTypeReg = /^image\/[\w]+$/;
      const allImages = item.files.every((file) => imgTypeReg.test(file.type));
      return allImages;
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
        'h-20 w-full overflow-hidden rounded-lg border border-dashed bg-subtle text-muted-foreground',
        isActive ? 'border-solid' : null,
        className
      )}
      ref={ref}
    >
      <div ref={drop} className="flex size-full items-center justify-center">
        {isActive
          ? t('generic:message:release-to-upload')
          : t('generic:message:drag-file-here')}
      </div>
    </div>
  );
});
