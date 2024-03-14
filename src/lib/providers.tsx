import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';

import { ConversationsContext } from './contexts';
import {
  useListConversationsQuery,
  useListModelsQuery,
  useListSettingsQuery,
} from './hooks';
import log from './log';
import { useAppStateStore } from './store';
import type { TConversationsContext } from './types';

export function RQProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          // With SSR, we usually want to set some default staleTime
          // above 0 to avoid refetching immediately on the client
          staleTime: 60 * 1000,
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function InitializationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { models, settings, refreshModels, setSettings } = useAppStateStore();
  const { data: modelList, isSuccess, isError } = useListModelsQuery();
  const {
    data: settingList,
    isSuccess: isSettingsSuccess,
    isError: isSettingsError,
  } = useListSettingsQuery();

  // Effects
  useEffect(() => {
    if (isSuccess) {
      refreshModels(modelList);
    }
  }, [modelList, isSuccess, isError]);

  useEffect(() => {
    if (isSettingsSuccess) {
      setSettings(settingList);
    }
  }, [settingList, isSettingsSuccess, isSettingsError]);

  useEffect(() => {
    log.info(`Models are refreshed! ${JSON.stringify(models)}`);
  }, [models]);

  return children;
}

export function ConversationsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: conversations, isSuccess } = useListConversationsQuery();
  const conversationContext = useMemo<TConversationsContext>(() => {
    return {
      conversations: isSuccess ? conversations : [],
      get: (id: number) =>
        conversations?.find((conversation) => conversation.id === id),
    };
  }, [conversations, isSuccess]);

  log.info('ConversationsContextProvider rendered!');

  return (
    <ConversationsContext.Provider value={conversationContext}>
      {children}
    </ConversationsContext.Provider>
  );
}
