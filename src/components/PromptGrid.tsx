import { CalendarIcon } from '@radix-ui/react-icons';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import {
  LIST_PROMPTS_KEY,
  useListPromptsQuery,
  usePromptCreator,
} from '@/lib/hooks';
import log from '@/lib/log';
import type { DialogHandler, NewPrompt, Prompt } from '@/lib/types';
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
  prompt: Prompt;
};

function PromptGridItem({ prompt }: GridItemProps) {
  return (
    <Card className={cn('mb-6 flex break-inside-avoid flex-col')}>
      <CardHeader>
        <CardTitle>{prompt.alias}</CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-hidden text-ellipsis">
        <p>{prompt.content}</p>
      </CardContent>
      <CardFooter className="justify-end text-sm text-muted-foreground">
        <div className="flex items-center justify-end text-xs">
          <CalendarIcon className="size-4" />
          <span className="ml-1">
            {prompt.createdAt
              ? dayjs(prompt.createdAt).format(DEFAULT_DATE_FORMAT)
              : 'Unknown'}
          </span>
        </div>
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
  const queryClient = useQueryClient();
  const { t } = useTranslation(['generic', 'page-prompts']);
  // Queries
  const { data: prompts, isSuccess } = useListPromptsQuery();
  const creator = usePromptCreator({
    onSuccess: async (prompt) => {
      // Update cache
      queryClient.setQueryData<Prompt[]>(LIST_PROMPTS_KEY, (old) =>
        old ? [...old, prompt] : [prompt]
      );
      // Show toast
      toast.success(t('page-prompts:message:create-prompt-success'));
    },
    onError: async (error, variables) => {
      await log.error(
        `Failed to create prompt: data = ${JSON.stringify(variables)}, error = ${error.message}`
      );
      toast.error(`Failed to create prompt: ${error.message}`);
    },
  });
  const newPromptDialogRef = useRef<DialogHandler>(null);

  // Callbacks
  const onCreateClick = useCallback(() => {
    newPromptDialogRef.current?.open();
  }, [newPromptDialogRef]);

  const onSubmit = useCallback(
    (newPrompt: NewPrompt) => {
      creator(newPrompt);
    },
    [creator]
  );

  return (
    <>
      <div className="mx-auto mt-12 w-full columns-3 gap-8 text-foreground">
        <AddPromptItem onClick={onCreateClick} />
        {isSuccess &&
          prompts.map((prompt) => (
            <PromptGridItem key={prompt.id} prompt={prompt} />
          ))}
      </div>
      <PromptFormDialog.New ref={newPromptDialogRef} onSubmit={onSubmit} />
    </>
  );
}
