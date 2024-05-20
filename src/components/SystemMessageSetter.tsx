import { useRef } from 'react';

import type { ConversationDetails, DialogHandler } from '@/lib/types';

import { SystemMessageDialog } from './SystemMessageDialog';
import { SystemMessageIndicator } from './SystemMessageIndicator';

export function SystemMessageSetter({
  conversation,
}: {
  conversation: ConversationDetails;
}) {
  const dialogRef = useRef<DialogHandler<ConversationDetails>>(null);

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
