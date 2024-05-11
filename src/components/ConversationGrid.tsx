import dayjs from 'dayjs';
import { Calendar, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import type { Conversation } from '@/lib/types';

import { ProviderTag } from './ProviderTag';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';

function ConversationGridItem({
  conversation,
}: {
  conversation: Conversation;
}) {
  return (
    <Link to={`/conversations/${conversation.id}`}>
      <Card className="flex h-52 flex-col text-clip hover:shadow-md">
        <CardHeader className="p-4">
          <div className="flex items-center text-xs">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="ml-1 text-muted-foreground">
              {conversation.createdAt
                ? dayjs(conversation.createdAt).format(DEFAULT_DATE_FORMAT)
                : 'Unknown'}
            </span>
            <MessageCircle className="ml-auto size-4 text-muted-foreground" />
            <span className="ml-1 text-muted-foreground">
              {conversation.messageCount}
            </span>
          </div>
        </CardHeader>
        <CardContent className="grow px-4 py-0">
          <p className="">{conversation.subject}</p>
        </CardContent>
        {conversation.modelProvider ? (
          <CardFooter className="p-4">
            <ProviderTag provider={conversation.modelProvider} />
          </CardFooter>
        ) : null}
      </Card>
    </Link>
  );
}
export function ConversationGrid({
  conversations,
}: {
  conversations: Conversation[];
}) {
  return (
    <div className="flex grow flex-col">
      <h2 className="text-3xl font-semibold tracking-tight">
        {conversations.length} conversations
      </h2>
      <div className="mt-6 grid grid-cols-3 gap-[26px]">
        {conversations.map((conversation) => {
          return (
            <ConversationGridItem
              conversation={conversation}
              key={conversation.id}
            />
          );
        })}
      </div>
    </div>
  );
}
