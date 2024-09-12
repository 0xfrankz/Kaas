import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { produce } from 'immer';
import { Calendar, Copy, Pencil, Send, Trash } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import {
  LIST_PROMPTS_KEY,
  usePromptCreator,
  usePromptDeleter,
  usePromptUpdater,
} from '@/lib/hooks';
import log from '@/lib/log';
import type { DialogHandler, Prompt } from '@/lib/types';
import { cn } from '@/lib/utils';

import PromptFormDialog from './PromptFormDialog';
import { PromptUseDialog } from './PromptUseDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './ui/context-menu';

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
        <CardTitle className="line-clamp-1">{prompt.alias}</CardTitle>
      </CardHeader>
      <CardContent className="grow">
        <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
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

export function PromptGrid({ prompts }: { prompts: Prompt[] }) {
  const [deletePrompt, setDeletePrompt] = useState<Prompt | null>(null);
  const queryClient = useQueryClient();
  const { t } = useTranslation(['generic', 'page-prompts']);
  const editPromptDialogRef = useRef<DialogHandler<Prompt>>(null);
  const usePromptDialogRef = useRef<DialogHandler<Prompt>>(null);
  // Queries
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
  const creator = usePromptCreator({
    onSuccess: async (prompt) => {
      // Update cache
      queryClient.setQueryData<Prompt[]>(LIST_PROMPTS_KEY, (old) =>
        old ? [...old, prompt] : [prompt]
      );
      // Show toast
      toast.success(t('page-prompts:message:create-prompt-success'));
    },
    onError: async (error, _variables) => {
      toast.error(`Failed to create prompt: ${error.message}`);
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

  const onDuplicateClick = useCallback(
    (prompt: Prompt) => {
      creator({
        alias: t('generic:message:copy-of', { original: prompt.alias }),
        content: prompt.content,
      });
    },
    [creator, t]
  );

  const onAlertDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setDeletePrompt(null);
    }
  }, []);

  return (
    <>
      <div className="mx-auto mt-6 grid w-full grid-cols-1 gap-5 text-foreground md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {prompts.map((prompt) => (
          <ContextMenu key={prompt.id}>
            <ContextMenuTrigger>
              <PromptGridItem
                key={prompt.id}
                prompt={prompt}
                onEditClick={onEditClick}
                onUseClick={onUseClick}
              />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onUseClick(prompt)}
              >
                <Send className="size-4" /> {t('generic:action:use')}
              </ContextMenuItem>
              <ContextMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onEditClick(prompt)}
              >
                <Pencil className="size-4" /> {t('generic:action:edit')}
              </ContextMenuItem>
              <ContextMenuItem
                className="cursor-pointer gap-2"
                onClick={() => onDuplicateClick(prompt)}
              >
                <Copy className="size-4" /> {t('generic:action:duplicate')}
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                className="cursor-pointer gap-2"
                onClick={() => setDeletePrompt(prompt)}
              >
                <Trash className="size-4" /> {t('generic:action:delete')}
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
      <PromptFormDialog.Edit
        ref={editPromptDialogRef}
        onSubmit={onEditSubmit}
        onDeleteClick={onDeleteClick}
      />
      <PromptUseDialog ref={usePromptDialogRef} />
      <AlertDialog open={!!deletePrompt} onOpenChange={onAlertDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('page-prompts:section:delete-prompt', {
                promptAlias: deletePrompt?.alias,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('page-prompts:message:delete-prompt-warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-none bg-secondary text-foreground hover:bg-secondary/80 hover:text-foreground">
              {t('generic:action:cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDeleteClick(deletePrompt as Prompt);
              }}
            >
              {t('generic:action:confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
