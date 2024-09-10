import { useRef } from 'react';

import type { Conversation, DialogHandler } from '@/lib/types';

import { SystemMessageDialog } from './SystemMessageDialog';
import { SystemMessageIndicator } from './SystemMessageIndicator';

export function SystemMessageSetter({
  conversation,
}: {
  conversation: Conversation;
}) {
  const dialogRef = useRef<DialogHandler<Conversation>>(null);

  return (
    <>
      <SystemMessageIndicator
        onClick={() => {
          dialogRef.current?.open(conversation);
        }}
        conversation={conversation}
      />
      <SystemMessageDialog ref={dialogRef} />
    </>
  );
}
