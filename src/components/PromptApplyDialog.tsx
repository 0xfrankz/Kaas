import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { useFilledPromptContext, useListPromptsQuery } from '@/lib/hooks';
import { extractVariables, interpolate } from '@/lib/prompts';
import { FilledPromptContextProvider } from '@/lib/providers';
import type { DialogHandler, Prompt } from '@/lib/types';
import { cn } from '@/lib/utils';

import PromptForm from './forms/PromptForm';
import { PromptPreviewer } from './PromptPreviewer';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

type FilledPrompt = {
  prompt: string;
  variables: {
    label: string;
    value: string;
  }[];
};

type GridProps = {
  prompts: Prompt[];
  onUseClick: (prompt: Prompt) => void;
};

type GridItemProps = {
  prompt: Prompt;
  onUseClick: (prompt: Prompt) => void;
};

type EditorProps = {
  prompt: Prompt;
  onCancel: () => void;
  onUseClick: (prompt: string) => void;
};

function PromptGridItem({ prompt, onUseClick }: GridItemProps) {
  const { t } = useTranslation(['generic']);
  return (
    <Card className={cn('mb-6 flex break-inside-avoid flex-col')}>
      <CardContent className="flex items-center justify-between p-4">
        <span className="max-w-40 truncate font-medium">{prompt.alias}</span>
        <Button
          className="ml-2"
          onClick={() => {
            onUseClick(prompt);
          }}
        >
          {t('generic:action:use')}
        </Button>
      </CardContent>
    </Card>
  );
}

function PromptGrid({ prompts, onUseClick }: GridProps) {
  return (
    <div className="mx-auto mt-6 grid w-full grid-cols-3 gap-8 text-foreground">
      {prompts.map((prompt) => (
        <PromptGridItem
          key={prompt.id}
          prompt={prompt}
          onUseClick={(p) => onUseClick(p)}
        />
      ))}
    </div>
  );
}

function NewPromptMaker({
  onUseClick,
}: {
  onUseClick: (prompt: string) => void;
}) {
  const { prompt } = useFilledPromptContext();
  const promptCtx = Object.fromEntries(
    prompt.variables?.map((v) => [v.label, v.value]) ?? []
  );
  const promptStr = interpolate(prompt.prompt, promptCtx);
  const { t } = useTranslation();

  const onClick = useCallback(() => {
    onUseClick(promptStr);
  }, [onUseClick, promptStr]);

  return (
    <Button onClick={onClick}>
      {/* <SendHorizonal className="size-4" /> */}
      {t('generic:action:insert')}
    </Button>
  );
}

function PromptEditor({ prompt, onCancel, onUseClick }: EditorProps) {
  const [filledPrompt, setFilledPrompt] = useState<FilledPrompt | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setFilledPrompt({
      prompt: prompt?.content ?? '',
      variables: Array.from(new Set(extractVariables(prompt?.content ?? '')))
        .sort()
        .map((label) => ({
          label,
          value: '',
        })),
    });
  }, [prompt]);

  return filledPrompt ? (
    <FilledPromptContextProvider defaultValue={filledPrompt}>
      {/* Template section */}
      <div className="flex items-center">
        <div className="flex size-8 items-center justify-center rounded-full border-2 border-foreground text-sm">
          1
        </div>
        <span className="ml-2">
          {t('page-prompts:message:fill-the-template')}
        </span>
      </div>
      <div className="flex grow gap-8 overflow-hidden">
        <ScrollArea className="flex-1">
          <h3 className="mb-2 text-muted-foreground">
            {t('page-prompts:section:template')}
          </h3>
          <PromptForm.Use id="promptForm" />
        </ScrollArea>
        <ScrollArea className="flex-1">
          <h3 className="mb-2 text-muted-foreground">
            {t('page-prompts:section:preview')}
          </h3>
          <PromptPreviewer />
        </ScrollArea>
      </div>
      <Separator />
      {/* Actions section */}
      <div className="flex items-center">
        <div className="flex size-8 items-center justify-center rounded-full border-2 border-foreground text-sm">
          2
        </div>
        <span className="ml-2">
          {t('page-conversation:message:insert-into-prompt')}
        </span>
      </div>
      <div className="flex h-fit items-center gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {t('generic:action:cancel')}
        </Button>
        <NewPromptMaker onUseClick={onUseClick} />
      </div>
    </FilledPromptContextProvider>
  ) : null;
}

export const PromptApplyDialog = forwardRef<
  DialogHandler<void>,
  {
    onUseClick: (prompt: string) => void;
  }
>(({ onUseClick }, ref) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const { t } = useTranslation(['page-conversation']);
  // Queries
  const { data: prompts, isSuccess } = useListPromptsQuery();

  useImperativeHandle(ref, () => ({
    open: () => {
      setShowDialog(true);
    },
    close: () => {
      setShowDialog(false);
    },
  }));

  useEffect(() => {
    if (!showDialog) setSelectedPrompt(null);
  }, [showDialog]);

  const render = () => {
    if (isSuccess) {
      if (selectedPrompt) {
        // return fill prompt view
        return (
          <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
            <DialogHeader>
              <DialogTitle>{selectedPrompt.alias}</DialogTitle>
            </DialogHeader>
            <PromptEditor
              prompt={selectedPrompt}
              onCancel={() => setSelectedPrompt(null)}
              onUseClick={onUseClick}
            />
          </DialogContent>
        );
      }
      // return grid view
      return (
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t('page-conversation:section:use-prompt')}
            </DialogTitle>
            <DialogDescription>
              {t('page-conversation:message:use-prompt-tips')}
            </DialogDescription>
          </DialogHeader>
          <PromptGrid
            prompts={prompts}
            onUseClick={(p) => setSelectedPrompt(p)}
          />
        </DialogContent>
      );
    }
    return null;
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      {render()}
    </Dialog>
  );
});
