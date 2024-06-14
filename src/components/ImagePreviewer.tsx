import { forwardRef, type HtmlHTMLAttributes } from 'react';

import { useFileUploaderContext } from '@/lib/hooks';
import type { FileData } from '@/lib/types';
import { cn } from '@/lib/utils';

type ImagePreviwerProps = {
  dataList: FileData[];
};

type ImageThumbnailProps = {
  imageData: FileData;
};

export function ImageThumbnail({ imageData }: ImageThumbnailProps) {
  return (
    <div className="size-12 overflow-hidden rounded-lg">
      <img
        src={imageData.data}
        alt={imageData.name}
        className="m-0 size-full object-cover"
      />
    </div>
  );
}

export const ImagePreviwer = forwardRef<
  HTMLDivElement,
  HtmlHTMLAttributes<HTMLDivElement>
>(({ className }, ref) => {
  const { files } = useFileUploaderContext();
  const render = () => {
    if (files.length > 0) {
      return (
        <div className={cn('w-full', className)} ref={ref}>
          <ul className="m-0 flex list-none gap-2 p-0">
            {files.map((f, idx) => {
              const key = `${f.name}_${idx}`;
              return (
                <li key={key}>
                  <ImageThumbnail imageData={f} />
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
