import { Check, SquarePen, X } from 'lucide-react';
import { useRef, useState } from 'react';

import type { ConversationDetails, Model } from '@/lib/types';
import { cn } from '@/lib/utils';

import { InputWithMenu } from '../InputWithMenu';
import { Button } from '../ui/button';
import InfoSection from './InfoSection';

type Props = {
  conversation: ConversationDetails;
  model?: Model;
  onEditDone: (newTitle: string) => void;
};

export function ConversationTitleBar({
  conversation,
  model,
  onEditDone,
}: Props) {
  const [titleText, setTitleText] = useState(conversation.subject);
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onConfirm();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className={cn(
        'box-border flex h-16 w-full max-w-full items-center justify-start gap-2 border-b border-border bg-purple-200 pl-16 pr-6 md:px-6',
        'bg-background'
      )}
    >
      {isEditing ? (
        <div className="flex grow items-center">
          <InputWithMenu
            className="size-fit max-w-40 text-base font-semibold text-foreground sm:max-w-60 md:max-w-screen-sm md:text-lg"
            defaultValue={titleText}
            size={titleText.length}
            ref={inputRef}
            onKeyDown={onKeyDown}
            autoFocus
          />
          <Button
            className="ml-2 size-6 rounded-full p-0 md:size-9"
            onClick={onConfirm}
          >
            <Check className="size-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={onCancel}
            className="ml-2 size-6 rounded-full p-0 md:size-9"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex grow items-center">
          <h1 className="size-fit max-w-40 truncate text-center text-base font-semibold text-foreground sm:max-w-60 md:max-w-screen-sm md:text-lg">
            {titleText}
          </h1>
          <Button
            className="ml-2"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <SquarePen className="size-4 text-muted-foreground" />
          </Button>
        </div>
      )}
      <InfoSection conversation={conversation} model={model} />
    </div>
  );
}
