import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { ConversationDetails, Model } from '@/lib/types';

import { ModelTag } from '../ModelTag';
import { ProxyIndicator } from '../ProxyIndicator';
import { SystemMessageSetter } from '../SystemMessageSetter';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { WideScreenSetter } from '../WideScreenSetter';
import { UsageCounter } from './UsageCounter';

type Props = {
  conversation: ConversationDetails;
  model?: Model;
};
export default function InfoSection({ conversation, model }: Props) {
  const navigate = useNavigate();
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="p-2 sm:hidden">
            <Info className="size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-fit gap-2"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ModelTag model={model} />
          <UsageCounter conversation={conversation} />
          <ProxyIndicator
            onClick={() => {
              navigate(`/settings`);
            }}
          />
          <SystemMessageSetter conversation={conversation} />
        </PopoverContent>
      </Popover>
      <div className="ml-auto hidden gap-2 sm:flex">
        <ModelTag model={model} />
        <UsageCounter conversation={conversation} />
        <ProxyIndicator
          onClick={() => {
            navigate(`/settings`);
          }}
        />
        <SystemMessageSetter conversation={conversation} />
        <WideScreenSetter />
      </div>
    </>
  );
}
