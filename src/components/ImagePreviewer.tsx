import { downloadDir } from '@tauri-apps/api/path';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { useHover } from 'ahooks';
import { Save, X } from 'lucide-react';
import { forwardRef, type HtmlHTMLAttributes, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import log from '@/lib/log';
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from './ui/dialog';

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
        className="m-0 size-full border-0 bg-transparent p-0"
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
  const { t } = useTranslation();

  const onSaveAsClick = async (imageData: FileData) => {
    const downloadDirPath = await downloadDir();
    const filePath = await save({
      defaultPath: `${downloadDirPath}/${imageData.fileName}`,
    });
    if (filePath) {
      try {
        await writeFile(filePath, imageData.fileData);
        toast.success(t('generic:message:image-saved-as', { path: filePath }));
      } catch (error: unknown) {
        if (error instanceof Error) {
          await log.error(`Error saving file: ${error.message}`);
        } else {
          await log.error(`Error saving file: ${String(error)}`);
        }
        toast.error(t('error:image-save-error'));
      }
    }
  };
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
        <DialogContent className="max-w-fit px-20">
          <DialogTitle className="hidden">Images Carousel</DialogTitle>
          <DialogDescription className="hidden">
            {files.length} images
          </DialogDescription>
          <Carousel className="w-full max-w-lg">
            <CarouselContent className="my-6">
              {files.map((f, idx) => {
                const key = `carousel_${f.fileName}_${idx}`;
                const blob = new Blob([f.fileData], { type: f.fileType });
                const imageSrc = URL.createObjectURL(blob);
                return (
                  <CarouselItem key={key} className="flex">
                    <ContextMenu>
                      <ContextMenuTrigger className="m-auto size-fit">
                        <img
                          src={imageSrc}
                          alt={f.fileName}
                          className="max-h-96 max-w-lg"
                        />
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => onSaveAsClick(f)}
                        >
                          <Save className="size-4" />
                          {t('generic:action:save-as')}
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {files.length > 1 ? (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            ) : null}
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  );
});
