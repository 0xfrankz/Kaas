import { Check, SquarePen, X } from 'lucide-react';
import { useRef, useState } from 'react';

import type { Model } from '@/lib/types';

import { ModelTag } from './ModelTag';
import { ProxyIndicator } from './ProxyIndicator';
import { Button } from './ui/button';
import { Input } from './ui/input';

type Props = {
  title: string;
  model?: Model;
  onEditDone: (newTitle: string) => void;
};

export function ConversationTitleBar({ title, model, onEditDone }: Props) {
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
    <div className="box-border flex h-16 w-full items-center justify-start gap-2 border-b border-border bg-background px-6">
      {isEditing ? (
        <>
          <Input
            className="size-fit max-w-[640px] text-lg font-semibold text-foreground"
            defaultValue={titleText}
            size={titleText.length}
            ref={inputRef}
          />
          <Button className="ml-2 size-9 rounded-full p-0" onClick={onConfirm}>
            <Check className="size-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={onCancel}
            className="ml-2 size-9 rounded-full p-0"
          >
            <X className="size-4" />
          </Button>
        </>
      ) : (
        <>
          <h1 className="size-fit max-w-[640px] truncate text-center text-lg font-semibold text-foreground">
            {titleText}
          </h1>
          <Button
            className=""
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <SquarePen className="size-4 text-muted-foreground" />
          </Button>
        </>
      )}
      <ModelTag model={model} className="ml-auto" />
      <ProxyIndicator className="ml-4" />
    </div>
  );
}
