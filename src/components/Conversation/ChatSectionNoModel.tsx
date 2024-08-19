import { useQueryClient } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import {
  OPTIONS_CONVERSATION_KEY,
  useConversationModelUpdater,
} from '@/lib/hooks';
import { useAppStateStore } from '@/lib/store';
import type {
  ConversationDetails,
  Model,
  StatefulDialogHandler,
} from '@/lib/types';

import { ModelPickerDialog } from '../ModelPickerDialog';
import { Button } from '../ui/button';

export function ChatSectionNoModel({
  conversation,
}: {
  conversation: ConversationDetails;
}) {
  const dialogRef = useRef<StatefulDialogHandler<string>>(null);
  const model = useAppStateStore((state) =>
    state.models.find((m) => m.id === conversation.modelId)
  );
  const { t } = useTranslation(['page-conversation']);

  // Queries
  const queryClient = useQueryClient();
  const modelUpdater = useConversationModelUpdater({
    onSettled(c) {
      // invalidate option's cache
      queryClient.invalidateQueries({
        queryKey: [...OPTIONS_CONVERSATION_KEY, { conversationId: c?.id }],
      });
    },
  });

  // Callbacks
  const onChooseClick = useCallback(() => {
    dialogRef.current?.open(conversation.subject);
  }, [conversation.subject]);

  const onChooseSubmit = useCallback(
    (selectedModel: Model) => {
      modelUpdater({
        conversationId: conversation.id,
        modelId: selectedModel.id,
      });
    },
    [conversation.id, modelUpdater]
  );

  // Hooks
  useEffect(() => {
    if (!model && dialogRef.current && !dialogRef.current.isOpen()) {
      // when model is not set, open picker dialog by default
      dialogRef.current.open(conversation.subject);
    }
  }, [model, conversation.subject]);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-4">
      <h2 className="text-center text-3xl font-semibold tracking-tight">
        {t('page-conversation:message:no-model')}
      </h2>
      <Button onClick={onChooseClick}>
        <Package className="size-4" />
        <span className="ml-2">{t('generic:action:choose-a-model')}</span>
      </Button>
      <ModelPickerDialog ref={dialogRef} onSubmit={onChooseSubmit} />
    </div>
  );
}
