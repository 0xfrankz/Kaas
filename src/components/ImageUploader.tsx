import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

import type { ImageData, ImageUploaderHandler } from '@/lib/types';

type ImageDropTargetProps = {
  onDrop: (files: File[]) => void;
};

type ImagePreviwerProps = {
  dataList: ImageData[];
};

type ImageThumbnailProps = {
  data: ImageData;
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
    <div ref={drop} className="h-[300px] w-full bg-blue-800">
      {isActive ? 'Release to drop' : 'Drag file here'}
    </div>
  );
}

export function ImageThumbnail({ data }: ImageThumbnailProps) {
  return data.dataUrl ? (
    <div className="size-16 overflow-hidden rounded-xl">
      <img
        src={data.dataUrl}
        alt={data.name}
        className="m-0 size-full object-cover"
      />
    </div>
  ) : null;
}

export function ImagePreviwer({ dataList }: ImagePreviwerProps) {
  const render = () => {
    if (dataList.length > 0) {
      return (
        <div className="w-full">
          <ul className="m-0 flex list-none gap-2 p-0">
            {dataList.map((d, idx) => {
              const key = `${d.name}_${idx}`;
              return (
                <li key={key} className="size-16">
                  <ImageThumbnail data={d} />
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
}

export const ImageUploader = forwardRef<ImageUploaderHandler, {}>((_, ref) => {
  const [imageDataList, setImageDataList] = useState<ImageData[]>([]);

  useImperativeHandle(
    ref,
    () => ({
      getImageDataList: () => {
        return imageDataList;
      },
    }),
    [imageDataList]
  );

  const onDrop = useCallback((files: File[]) => {
    files.forEach((file) => {
      const fr = new FileReader();
      fr.onload = () => {
        setImageDataList((old) => [
          ...old,
          {
            name: file.name,
            dataUrl: fr.result as string,
          },
        ]);
      };
      fr.readAsDataURL(file);
    });
  }, []);

  return (
    <div className="fixed bottom-1/3 right-0 flex h-[400px] w-[200px] flex-col bg-red-800 p-6">
      <ImagePreviwer dataList={imageDataList} />
      <ImageDropTarget onDrop={onDrop} />
    </div>
  );
});
