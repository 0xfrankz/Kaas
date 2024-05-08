import dayjs from 'dayjs';
import { Calendar, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DEFAULT_DATE_FORMAT } from '@/lib/constants';
import type { Conversation } from '@/lib/types';

import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';

function ConversationGridItem({
  conversation,
}: {
  conversation: Conversation;
}) {
  return (
    <Link to={`/conversations/${conversation.id}`}>
      <Card className="flex h-52 flex-col text-clip border border-slate-500 bg-clip-border shadow-none">
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
        <CardFooter className="p-4">
          <Badge>{conversation.modelProvider}</Badge>
        </CardFooter>
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
