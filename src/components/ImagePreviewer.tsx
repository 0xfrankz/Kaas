import { useHover } from 'ahooks';
import { X } from 'lucide-react';
import { forwardRef, type HtmlHTMLAttributes, useRef, useState } from 'react';

import type { FileData } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

type ImagePreviewerProps = {
  files: FileData[];
  deletable: boolean;
  onDelete: (index: number) => void;
};

type ImageThumbnailProps = {
  imageData: FileData;
  deletable: boolean;
  onDelete: () => void;
  onClick: () => void;
};

export function ImageThumbnail({
  imageData,
  deletable = true,
  onDelete,
  onClick,
}: ImageThumbnailProps) {
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const blob = new Blob([imageData.fileData], { type: imageData.fileType });
  const imageSrc = URL.createObjectURL(blob);

  return (
    <div className="relative size-12" ref={ref}>
      <button
        type="button"
        className="m-0 border-0 bg-transparent p-0"
        onClick={onClick}
        aria-label={`View ${imageData.fileName}`}
      >
        <img
          src={imageSrc}
          alt={imageData.fileName}
          className="m-0 size-full rounded-lg object-cover"
        />
      </button>
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
  const [open, setOpen] = useState(false);
  return (
    <div className={cn('w-full', className)} ref={ref}>
      <ul className="m-0 flex min-h-12 list-none gap-2 p-0">
        {files.map((f, idx) => {
          const key = `${f.fileName}_${idx}`;
          return (
            <li key={key}>
              <ImageThumbnail
                imageData={f}
                deletable={deletable}
                onDelete={() => onDelete(idx)}
                onClick={() => setOpen(true)}
              />
            </li>
          );
        })}
      </ul>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="hidden">Images Carousel</DialogTitle>
          <Carousel className="w-full max-w-xs">
            <CarouselContent>
              {files.map((f, idx) => {
                const key = `carousel_${f.fileName}_${idx}`;
                const blob = new Blob([f.fileData], { type: f.fileType });
                const imageSrc = URL.createObjectURL(blob);
                return (
                  <CarouselItem key={key}>
                    <img src={imageSrc} alt={f.fileName} />
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  );
});
