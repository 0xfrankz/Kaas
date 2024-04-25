import { CheckIcon, Cross2Icon, Pencil2Icon } from '@radix-ui/react-icons';
import { useRef, useState } from 'react';

import { Button } from './ui/button';
import { Input } from './ui/input';

type Props = {
  title: string;
  onEditDone: (newTitle: string) => void;
};

export function EditableTitleBar({ title, onEditDone }: Props) {
  const [titleText, setTitleText] = useState(title);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onConfirm = () => {
    if (inputRef.current) {
      onEditDone(inputRef.current.value);
      setTitleText(inputRef.current.value); // update title optimistically
    }
    setIsEditing(false);
  };

  const onCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="box-border flex h-16 w-full items-center justify-center border-b border-border bg-background">
      {isEditing ? (
        <>
          <Input
            className="h-fit w-[592px] text-lg font-semibold text-foreground"
            defaultValue={titleText}
            ref={inputRef}
          />
          <Button className="ml-2 size-9 rounded-full p-0" onClick={onConfirm}>
            <CheckIcon className="size-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={onCancel}
            className="ml-2 size-9 rounded-full p-0"
          >
            <Cross2Icon className="size-4" />
          </Button>
        </>
      ) : (
        <>
          <h1 className="h-fit w-[592px] truncate text-center text-lg font-semibold text-foreground">
            {titleText}
          </h1>
          <Button
            className="fixed right-10"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <Pencil2Icon className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}
