import React from 'react';

import type { TConversationsContext } from './types';

export const ConversationsContext = React.createContext<
  TConversationsContext | undefined
>(undefined);
