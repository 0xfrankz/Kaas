import { createContext } from 'react';

import type {
  TConversationsContext,
  TFilledPromptContext,
  TMessageListContext,
} from './types';

export const ConversationsContext = createContext<
  TConversationsContext | undefined
>(undefined);

export const FilledPromptContext = createContext<
  TFilledPromptContext | undefined
>(undefined);

export const MessageListContext = createContext<
  TMessageListContext | undefined
>(undefined);
