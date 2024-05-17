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
          console.log('system message click', dialogRef);
          dialogRef.current?.open(conversation);
        }}
      />
      <SystemMessageDialog
        ref={dialogRef}
        onSubmit={() => console.log('system message submit')}
      />
    </>
  );
}
