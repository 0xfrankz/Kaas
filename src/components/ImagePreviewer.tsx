import { useHover } from 'ahooks';
import { X } from 'lucide-react';
import { forwardRef, type HtmlHTMLAttributes, useRef } from 'react';

import type { FileData } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';

type ImagePreviewerProps = {
  files: FileData[];
  deletable: boolean;
  onDelete: (index: number) => void;
};

type ImageThumbnailProps = {
  imageData: FileData;
  deletable: boolean;
  onDelete: () => void;
};

export function ImageThumbnail({
  imageData,
  deletable = true,
  onDelete,
}: ImageThumbnailProps) {
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const blob = new Blob([imageData.fileData], { type: imageData.fileType });
  const imageSrc = URL.createObjectURL(blob);

  return (
    <div className="relative size-12" ref={ref}>
      <img
        src={imageSrc}
        alt={imageData.fileName}
        className="m-0 size-full rounded-lg object-cover"
      />
      {isHovering && deletable ? (
        <Button
          className="absolute -right-1 -top-1 size-3 rounded-full bg-white p-0"
          onClick={onDelete}
        >
          <X className="size-full text-black" />
        </Button>
      ) : null}
    </div>
  );
}

export const ImagePreviwer = forwardRef<
  HTMLDivElement,
  HtmlHTMLAttributes<HTMLDivElement> & ImagePreviewerProps
>(({ className, files, deletable = true, onDelete }, ref) => {
  const render = () => {
    if (files.length > 0) {
      return (
        <div className={cn('w-full', className)} ref={ref}>
          <ul className="m-0 flex list-none gap-2 p-0">
            {files.map((f, idx) => {
              const key = `${f.fileName}_${idx}`;
              return (
                <li key={key}>
                  <ImageThumbnail
                    imageData={f}
                    deletable={deletable}
                    onDelete={() => onDelete(idx)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    return null;
  };
  return render();
});
