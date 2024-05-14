import { useTranslation } from 'react-i18next';

import { SlideLeftTransition } from '@/components/animation/SlideLeftTransition';
import { ConversationHistory } from '@/components/ConversationHistory';
import TwoColumns from '@/layouts/TwoColumns';
import { errorGuard } from '@/lib/utils';

function NewConversation() {
  const { t } = useTranslation();
  return (
    <SlideLeftTransition motionKey="new-conversation">
      <TwoColumns>
        <TwoColumns.Left>
          <ConversationHistory activeConversationId={0} />
        </TwoColumns.Left>
        <TwoColumns.Right className="relative">
          <h1>Select a model first</h1>
          {/* only when a conversation is created ??? */
          /* <ConversationOptionsDialog
            conversation={conversation}
            className="absolute bottom-[38px] right-10 size-9 rounded-full p-0 shadow"
          /> */}
        </TwoColumns.Right>
      </TwoColumns>
    </SlideLeftTransition>
  );
}

export default errorGuard(<NewConversation />);
