import { Plus } from 'lucide-react';
import { useCallback, useRef } from 'react';

import type { DialogHandler } from '@/lib/types';
import { cn } from '@/lib/utils';

import PromptFormDialog from './PromptFormDialog';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';

type GridItemProps = {
  alias: string;
};

function PromptGridItem({ alias }: GridItemProps) {
  const double = Math.ceil(Math.random() * 10) % 2 === 0;
  return (
    <Card className={cn('mb-6 flex break-inside-avoid flex-col')}>
      <CardHeader>
        <CardTitle>{alias}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 min-h-20 overflow-hidden text-ellipsis">
        <p>
          {double
            ? 'This is the prompt! This is the prompt!'
            : 'This is the prompt! This is the prompt! This is the prompt! This is the prompt! This is the prompt! This is the prompt!'}
        </p>
      </CardContent>
      <CardFooter className="justify-end text-sm text-muted-foreground">
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}

function AddPromptItem({ onClick }: { onClick: () => void }) {
  return (
    <Button className="mb-6 h-fit w-full" onClick={onClick}>
      <div className="flex grow flex-col items-center justify-center space-y-1.5 py-4">
        <Plus className="size-10" />
        <span>Create new prompt template</span>
      </div>
    </Button>
  );
}

export function PromptGrid() {
  const newPromptDialogRef = useRef<DialogHandler>(null);

  const onCreateClick = useCallback(() => {
    newPromptDialogRef.current?.open();
  }, [newPromptDialogRef]);

  return (
    <>
      <div className="mx-auto mt-12 w-full columns-3 gap-8 text-foreground">
        <AddPromptItem onClick={onCreateClick} />
        {Array.from({ length: 10 }, (_, i) => (
          <PromptGridItem key={i} alias={`prompt-${i + 1}`} />
        ))}
      </div>
      <PromptFormDialog.New
        ref={newPromptDialogRef}
        onSubmit={() => console.log('submitted')}
      />
    </>
  );
}
