import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { forwardRef, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { LIST_PROMPTS_KEY, usePromptCreator } from '@/lib/hooks';
import type { DialogHandler, NewPrompt, Prompt } from '@/lib/types';
import { cn } from '@/lib/utils';

import PromptFormDialog from '../PromptFormDialog';
import type { ButtonProps } from '../ui/button';
import { Button } from '../ui/button';

export const PromptCreator = forwardRef<
  HTMLButtonElement,
  ButtonProps & { forceShowText?: boolean }
>(({ forceShowText = false, className, ...props }, ref) => {
  const { t } = useTranslation();
  const newPromptDialogRef = useRef<DialogHandler<void>>(null);

  // Queries
  const queryClient = useQueryClient();
  const creator = usePromptCreator({
    onSuccess: async (prompt) => {
      // Update cache
      queryClient.setQueryData<Prompt[]>(LIST_PROMPTS_KEY, (old) =>
        old ? [...old, prompt] : [prompt]
      );
      // Show toast
      toast.success(t('page-prompts:message:create-prompt-success'));
      // Close dialog
      newPromptDialogRef.current?.close();
    },
    onError: async (error, _variables) => {
      toast.error(`Failed to create prompt: ${error.message}`);
    },
  });

  // Callbacks
  const onCreateClick = () => {
    newPromptDialogRef.current?.open();
  };

  const onCreateSubmit = useCallback(
    (newPrompt: NewPrompt) => {
      creator(newPrompt);
    },
    [creator]
  );

  return (
    <>
      <Button
        onClick={onCreateClick}
        ref={ref}
        {...props}
        className={className}
      >
        <Plus className="size-4" />
        <span
          className={cn('ml-2', forceShowText ? 'inline' : 'hidden lg:inline')}
        >
          {t('generic:action:create-prompt')}
        </span>
      </Button>
      <PromptFormDialog.New
        ref={newPromptDialogRef}
        onSubmit={onCreateSubmit}
      />
    </>
  );
});
