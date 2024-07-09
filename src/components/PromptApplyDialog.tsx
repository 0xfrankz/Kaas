import { SendHorizonal } from 'lucide-react';
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

  const onClick = useCallback(() => {
    onUseClick(promptStr);
  }, [prompt]);

  return (
    <Button onClick={onClick}>
      <SendHorizonal className="size-4" />
    </Button>
  );
}

function PromptEditor({ prompt, onCancel, onUseClick }: EditorProps) {
  const [filledPrompt, setFilledPrompt] = useState<FilledPrompt | null>(null);
  const { t } = useTranslation(['page-conversation']);

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
      <div className="flex max-h-[600px] gap-4 overflow-hidden">
        <ScrollArea className="flex-1">
          {prompt.alias}
          <PromptForm.Use id="promptForm" />
        </ScrollArea>
        <div className="flex flex-1 flex-col">
          <ScrollArea className="flex-1 rounded-2xl bg-muted">
            <PromptPreviewer />
          </ScrollArea>
          <div className="flex h-fit items-center justify-end gap-2">
            <Button variant="secondary" onClick={onCancel}>
              {t('generic:action:cancel')}
            </Button>
            <NewPromptMaker onUseClick={onUseClick} />
          </div>
        </div>
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {t('page-conversation:section:use-prompt')}
              </DialogTitle>
              <DialogDescription>
                {t('page-conversation:message:use-prompt-tips')}
              </DialogDescription>
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
