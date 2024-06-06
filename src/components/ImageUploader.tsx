import { useCallback, useState } from 'react';
import type { DropTargetMonitor } from 'react-dnd';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';

type ImageDropTargetProps = {
  onDrop: (files: File[]) => void;
};

type ImagePreviwerProps = {
  files: File[];
};

type ImageThumbnailProps = {
  file: File;
};

function ImageDropTarget({ onDrop }: ImageDropTargetProps) {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop(item: { files: File[] }) {
      console.log('drop', item);
      onDrop(item.files);
    },
    canDrop(item: { files: File[] }) {
      console.log('canDrop', item.files);
      const imgTypeReg = /^image\/[\w]+$/;
      const allImages = item.files.every((file) => imgTypeReg.test(file.type));
      return allImages;
    },
    // hover(item: any) {
    //   console.log('hover', item.files, item.items);
    // },
    collect: (monitor: DropTargetMonitor) => {
      // const item = monitor.getItem() as any;
      // if (item) {
      //   console.log('collect', item.files, item.items);
      // }

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

function ImageThumbnail({ file }: ImageThumbnailProps) {
  const imageObject = URL.createObjectURL(file);
  return <img src={imageObject} alt={file.name} className="size-16" />;
}

function ImagePreviwer({ files }: ImagePreviwerProps) {
  const render = () => {
    if (files.length > 0) {
      return (
        <ul className="flex gap-2">
          {files.map((file, idx) => {
            const key = `${file.name}_${idx}`;
            return (
              <li key={file.name}>
                <ImageThumbnail file={file} />
              </li>
            );
          })}
        </ul>
      );
    }
    return <span>No files to preview yet</span>;
  };
  return <div className="h-[100px] w-full bg-green-800">{render()}</div>;
}

export function ImageUploader() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const onDrop = useCallback((files: File[]) => {
    setImageFiles((old) => [...old, ...files]);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 flex h-[400px] w-full flex-col bg-red-800 p-6">
      <ImagePreviwer files={imageFiles} />
      <ImageDropTarget onDrop={onDrop} />
    </div>
  );
}
