import { Plus } from 'lucide-react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useBlankConversationCreator } from '@/lib/hooks';

import type { ButtonProps } from './ui/button';
import { Button } from './ui/button';

export const ConversationStarter = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const creator = useBlankConversationCreator({
      onSettled: async (conversation, error) => {
        if (!error && conversation) {
          navigate(`/conversations/${conversation.id}`);
        } else {
          const errorMsg = error?.message ?? '';
          toast.error(
            t('page-conversations:message:create-conversation-error', {
              errorMsg,
            })
          );
        }
      },
    });

    const onCreateClick = () => {
      creator(t('generic:label:new-conversation'));
    };

    return (
      <Button
        onClick={onCreateClick}
        ref={ref}
        {...props}
        className={className}
      >
        <Plus className="size-4" />
        <span className="ml-2">
          {t('generic:action:start-new-conversation')}
        </span>
      </Button>
    );
  }
);
