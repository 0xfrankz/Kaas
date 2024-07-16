import { createContext } from 'react';

import type {
  TConversationsContext,
  TFileUploaderContext,
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

export const FileUploaderContext = createContext<
  TFileUploaderContext | undefined
>(undefined);
