import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { produce } from 'immer';
import { Calendar } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import {
  LIST_PROMPTS_KEY,
  useListPromptsQuery,
  usePromptDeleter,
  usePromptUpdater,
} from '@/lib/hooks';
import log from '@/lib/log';
import type { DialogHandler, Prompt } from '@/lib/types';
import { cn } from '@/lib/utils';

import PromptFormDialog from './PromptFormDialog';
import { PromptUseDialog } from './PromptUseDialog';
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
  onEditClick: (prompt: Prompt) => void;
  onUseClick: (prompt: Prompt) => void;
};

function PromptGridItem({ prompt, onEditClick, onUseClick }: GridItemProps) {
  const { t } = useTranslation(['generic']);
  return (
    <Card className={cn('flex flex-col')}>
      <CardHeader>
        <CardTitle className="max-h-4 truncate">{prompt.alias}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="h-20 max-h-20 truncate whitespace-pre-wrap text-sm text-muted-foreground">
          {prompt.content}
        </p>
      </CardContent>
      <CardFooter className="items-center justify-start">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="ml-1 text-muted-foreground">
            {prompt.createdAt
              ? dayjs(prompt.createdAt).format(DEFAULT_DATE_FORMAT)
              : 'Unknown'}
          </span>
        </div>
        <Button
          variant="secondary"
          className="ml-auto"
          onClick={() => {
            onEditClick(prompt);
          }}
        >
          {t('generic:action:edit')}
        </Button>
        <Button
          className="ml-2"
          onClick={() => {
            onUseClick(prompt);
          }}
        >
          {t('generic:action:use')}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PromptGrid() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(['generic', 'page-prompts']);
  const editPromptDialogRef = useRef<DialogHandler<Prompt>>(null);
  const usePromptDialogRef = useRef<DialogHandler<Prompt>>(null);
  // Queries
  const { data: prompts, isSuccess } = useListPromptsQuery();

  const updater = usePromptUpdater({
    onSuccess: async (prompt) => {
      // Update cache
      queryClient.setQueryData<Prompt[]>(LIST_PROMPTS_KEY, (old) =>
        produce(old, (draft) => {
          const index = draft?.findIndex((p) => p.id === prompt.id) ?? -1;
          if (index !== -1 && draft) {
            draft[index] = prompt;
          }
        })
      );
      // Show toast
      toast.success(t('page-prompts:message:update-prompt-success'));
      // Close dialog
      editPromptDialogRef.current?.close();
    },
    onError: async (error, variables) => {
      console.log(error);
      await log.error(
        `Failed to update prompt: data = ${JSON.stringify(variables)}, error = ${error.message}`
      );
      toast.error(`Failed to update prompt: ${error.message}`);
    },
  });
  const deleter = usePromptDeleter({
    onSuccess: async (prompt) => {
      // Update cache
      queryClient.setQueryData<Prompt[]>(LIST_PROMPTS_KEY, (old) =>
        produce(old, (draft) => {
          return draft?.filter((p) => p.id !== prompt.id);
        })
      );
      // Show toast
      toast.success(t('page-prompts:message:delete-prompt-success'));
      // Close dialog
      editPromptDialogRef.current?.close();
    },
    onError: async (error, variables) => {
      await log.error(
        `Failed to delete prompt: data = ${JSON.stringify(variables)}, error = ${error.message}`
      );
      toast.error(`Failed to delete prompt: ${error.message}`);
    },
  });

  // Callbacks
  const onEditClick = useCallback((prompt: Prompt) => {
    editPromptDialogRef.current?.open(prompt);
  }, []);

  const onUseClick = useCallback((prompt: Prompt) => {
    usePromptDialogRef.current?.open(prompt);
  }, []);

  const onEditSubmit = useCallback(
    (prompt: Prompt) => {
      updater(prompt);
    },
    [updater]
  );

  const onDeleteClick = useCallback(
    (prompt: Prompt) => {
      deleter(prompt.id);
    },
    [deleter]
  );

  return (
    <>
      <div className="mx-auto mt-6 grid w-full grid-cols-3 gap-8 text-foreground">
        {isSuccess &&
          prompts.map((prompt) => (
            <PromptGridItem
              key={prompt.id}
              prompt={prompt}
              onEditClick={onEditClick}
              onUseClick={onUseClick}
            />
          ))}
      </div>
      <PromptFormDialog.Edit
        ref={editPromptDialogRef}
        onSubmit={onEditSubmit}
        onDeleteClick={onDeleteClick}
      />
      <PromptUseDialog
        ref={usePromptDialogRef}
        onConfirm={() => {
          console.log('onConfirm');
        }}
      />
    </>
  );
}
