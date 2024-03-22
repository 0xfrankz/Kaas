import type {
  QueryKey,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import {
  invokeCallBot,
  invokeCreateConversation,
  invokeCreateMessage,
  invokeCreateModel,
  invokeGetOptions,
  invokeListConversations,
  invokeListMessages,
  invokeListModels,
  invokeListSettings,
  invokeUpdateOptions,
  invokeUpsertSetting,
} from './commands';
import { ConversationsContext } from './contexts';
import type {
  AzureOptions,
  CommandError,
  Conversation,
  Message,
  Model,
  NewMessage,
  Setting,
  TConversationsContext,
  UnsavedConversation,
  UnsavedModel,
} from './types';

export const LIST_MODELS_KEY = ['list-models'];
export const LIST_SETTINGS_KEY = ['list-settings'];
export const LIST_CONVERSATIONS_KEY = ['list-conversations'];
export const DETAIL_CONVERSATION_KEY = ['detail-conversation'];
export const OPTIONS_CONVERSATION_KEY = ['options-conversation'];
export const LIST_MESSAGES_KEY = ['list-messages'];

export function useCreateModelMutation(): UseMutationResult<
  Model,
  CommandError,
  UnsavedModel
> {
  return useMutation({
    mutationFn: invokeCreateModel,
  });
}

export function useListModelsQuery(): UseQueryResult<Model[], CommandError> {
  return useQuery({
    queryKey: LIST_MODELS_KEY,
    queryFn: invokeListModels,
  });
}

export function useListSettingsQuery(): UseQueryResult<
  Setting[],
  CommandError
> {
  return useQuery({
    queryKey: LIST_SETTINGS_KEY,
    queryFn: invokeListSettings,
  });
}

export function useUpsertSettingMutation(): UseMutationResult<
  Setting,
  CommandError,
  Setting
> {
  return useMutation({
    mutationFn: invokeUpsertSetting,
  });
}

export function useCreateConversationMutation(): UseMutationResult<
  Conversation,
  CommandError,
  UnsavedConversation
> {
  return useMutation({
    mutationFn: invokeCreateConversation,
  });
}

export function useListConversationsQuery(): UseQueryResult<
  Conversation[],
  CommandError
> {
  return useQuery({
    queryKey: LIST_CONVERSATIONS_KEY,
    queryFn: invokeListConversations,
  });
}

export function useGetOptionsQuery(conversationId: number): {
  key: QueryKey;
  query: UseQueryResult<AzureOptions, CommandError>;
} {
  const key = [...OPTIONS_CONVERSATION_KEY, { conversationId }];
  return {
    key,
    query: useQuery({
      queryKey: key,
      queryFn: () => invokeGetOptions(conversationId),
      retry: false,
    }),
  };
}

export function useListMessagesQuery(
  conversationId: number
): UseQueryResult<Message[], CommandError> {
  return useQuery({
    queryKey: [...LIST_MESSAGES_KEY, { conversationId }],
    queryFn: () => invokeListMessages(conversationId),
  });
}

export function useCreateMessageMutation(): UseMutationResult<
  Message,
  CommandError,
  NewMessage
> {
  return useMutation({
    mutationFn: invokeCreateMessage,
  });
}

export function useCallBotMutation(): UseMutationResult<
  Message,
  CommandError,
  Message
> {
  return useMutation({
    mutationFn: invokeCallBot,
  });
}

export function useUpdateOptionsMutation(): UseMutationResult<
  void,
  CommandError,
  { conversationId: number; options: AzureOptions }
> {
  return useMutation({
    mutationFn: invokeUpdateOptions,
  });
}

// Context hooks
export function useConversationsContext(): TConversationsContext {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error(
      'useConversationsContext must be used within a ConversationsContextProvider'
    );
  }

  return context;
}
