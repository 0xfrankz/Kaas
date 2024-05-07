import { createContext } from 'react';

import type { TConversationsContext, TFilledPromptContext } from './types';

export const ConversationsContext = createContext<
  TConversationsContext | undefined
>(undefined);

export const FilledPromptContext = createContext<
  TFilledPromptContext | undefined
>(undefined);
