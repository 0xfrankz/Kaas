import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { useRef } from 'react';
import { useParams } from 'react-router-dom';

import { ChatSection } from '@/components/ChatSection';
import { ConversationHistory } from '@/components/ConversationHistory';
import { AzureOptionsForm } from '@/components/forms/AzureOptionsForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TwoColumns from '@/layouts/TwoColumns';
import { AppError, ERROR_TYPE_APP_STATE } from '@/lib/error';
import { useConversationsContext } from '@/lib/hooks';
import log from '@/lib/log';
import type { Conversation } from '@/lib/types';
import { errorGuard, parseNumberOrNull } from '@/lib/utils';

type Params = {
  conversationId: string;
};

function ConversationPage() {
  log.info('ConversationPage rendered!');
  const { conversationId } = useParams<Params>();
  const formRef = useRef<HTMLFormElement>(null);
  const { get: getConversation } = useConversationsContext();
  const cid = parseNumberOrNull(conversationId);
  const conversation = cid ? getConversation(cid) : null;
  if (cid === null) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      `${conversationId} is not a valid number`,
      `Oops, the conversation with id = ${conversationId} is missing`
    );
  }
  if (!conversation) {
    // parent context is not ready
    return null;
  }

  return (
    <TwoColumns>
      <TwoColumns.Left>
        <ConversationHistory activeConversationId={cid} />
      </TwoColumns.Left>
      <TwoColumns.Right className="relative">
        <ChatSection
          conversation={conversation as Conversation}
          key={conversation.id}
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="absolute bottom-[38px] right-10 size-9 rounded-full p-0 shadow"
            >
              <MixerHorizontalIcon className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Change options of this conversation</DialogTitle>
              <DialogDescription>
                Altering the options can yield unpredictable behaviors and even
                errors. Make sure you know what you are changing.
              </DialogDescription>
            </DialogHeader>
            <AzureOptionsForm
              id="optionsForm"
              ref={formRef}
              onFormSubmit={(formData) => {
                console.log('AzureOptionsForm: ', formData);
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button form="optionsForm">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TwoColumns.Right>
    </TwoColumns>
  );
}

export default errorGuard(<ConversationPage />);
