import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';

import { ConversationsContext } from './contexts';
import { AppError, ERROR_TYPE_APP_STATE } from './error';
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
  const [initialized, setInitialized] = useState(false);
  const { models, settings, refreshModels, setSettings } = useAppStateStore();
  const {
    data: modelList,
    isSuccess: isModelsSuccess,
    isError: isModelsError,
    error: modelsError,
  } = useListModelsQuery();
  const {
    data: settingList,
    isSuccess: isSettingsSuccess,
    isError: isSettingsError,
    error: settingsError,
  } = useListSettingsQuery();

  useEffect(() => {
    if (isModelsSuccess && isSettingsSuccess) {
      refreshModels(modelList);
      setSettings(settingList);
      setInitialized(true);
      log.info('App successfully initialized');
    }
  }, [isModelsSuccess, isSettingsSuccess, modelList, settingList]);

  if (initialized) {
    // Successfully initialized
    return children;
  }
  if (isModelsError) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      modelsError.message,
      'Failed to initiate models!'
    );
  }
  if (isSettingsError) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      settingsError.message,
      'Failed to initiate settings!'
    );
  }
  // Loading
  return null;
}

export function ConversationsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: conversations,
    isSuccess,
    isError,
    error,
  } = useListConversationsQuery();
  const conversationContext = useMemo<TConversationsContext>(() => {
    return {
      conversations: isSuccess ? conversations : [],
      isLoading: !isSuccess,
      get: (id: number) =>
        conversations?.find((conversation) => conversation.id === id),
    };
  }, [conversations, isSuccess]);

  if (isError) {
    throw new AppError(
      ERROR_TYPE_APP_STATE,
      error.message,
      'Failed to load conversations!'
    );
  }

  return (
    <ConversationsContext.Provider value={conversationContext}>
      {children}
    </ConversationsContext.Provider>
  );
}
