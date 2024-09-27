import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SETTING_DISPLAY_LANGUAGE, SETTING_DISPLAY_THEME } from './constants';
import {
  ConversationsContext,
  FileUploaderContext,
  FilledPromptContext,
  MessageListContext,
} from './contexts';
import { AppError, ERROR_TYPE_APP_STATE } from './error';
import {
  useListConversationsQuery,
  useListModelsQuery,
  useListSettingsQuery,
} from './hooks';
import { useAppStateStore } from './store';
import type {
  FileData,
  FilledPrompt,
  TConversationsContext,
  TMessageListContext,
} from './types';

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
  const { i18n } = useTranslation();
  const { setTheme } = useTheme();
  const { setModels, setSettings } = useAppStateStore();
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
    if (isModelsSuccess) {
      setModels(modelList);
    }
  }, [isModelsSuccess, modelList, setModels]);

  useEffect(() => {
    if (isSettingsSuccess) {
      setSettings(settingList);
      // apply language setting
      const language = settingList.find(
        (s) => s.key === SETTING_DISPLAY_LANGUAGE
      )?.value;
      if (language !== i18n.language) {
        i18n.changeLanguage(language);
      }
      // apply theme setting
      const themeSetting = settingList.find(
        (s) => s.key === SETTING_DISPLAY_THEME
      )?.value as string;
      setTheme(themeSetting);
    }
  }, [i18n, isSettingsSuccess, setModels, setSettings, setTheme, settingList]);

  useEffect(() => {
    if (isModelsSuccess && isSettingsSuccess) {
      setInitialized(true);
    }
  }, [isModelsSuccess, isSettingsSuccess]);

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

export function FilledPromptContextProvider({
  defaultValue,
  children,
}: {
  defaultValue: FilledPrompt;
  children: React.ReactNode;
}) {
  const [prompt, setPrompt] = useState(defaultValue);
  const context = useMemo(
    () => ({
      prompt,
      setPrompt,
    }),
    [prompt, setPrompt]
  );

  return (
    <FilledPromptContext.Provider value={context}>
      {children}
    </FilledPromptContext.Provider>
  );
}

export function MessageListContextProvider({
  messages,
  onRegenerateClick,
  onReceiverReady,
  children,
}: TMessageListContext & {
  children: React.ReactNode;
}) {
  const messageListContext = useMemo(() => {
    return {
      messages,
      onRegenerateClick,
      onReceiverReady,
    };
  }, [messages, onRegenerateClick, onReceiverReady]);

  return (
    <MessageListContext.Provider value={messageListContext}>
      {children}
    </MessageListContext.Provider>
  );
}

export function FileUploaderContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [files, setFiles] = useState<FileData[]>([]);
  const context = useMemo(
    () => ({
      files,
      addFiles: (newFiles: FileData[]) => {
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      },
      removeFile: (index: number) => {
        setFiles((prevFiles) => {
          const newFiles = [...prevFiles];
          newFiles.splice(index, 1);
          return newFiles;
        });
      },
    }),
    [files]
  );
  return (
    <FileUploaderContext.Provider value={context}>
      {children}
    </FileUploaderContext.Provider>
  );
}
