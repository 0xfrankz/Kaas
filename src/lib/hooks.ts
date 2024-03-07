import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useContext } from 'react';

import {
  invokeCreateConversation,
  invokeCreateModel,
  invokeListConversations,
  invokeListModels,
  invokeListSettings,
  invokeUpsertSetting,
} from './commands';
import { ConversationsContext } from './contexts';
import type {
  CommandError,
  Conversation,
  Model,
  Setting,
  TConversationsContext,
  UnsavedConversation,
  UnsavedModel,
} from './types';

export const LIST_MODELS_KEY = ['list-models'];
export const LIST_SETTINGS_KEY = ['list-settings'];
export const LIST_CONVERSATIONS_KEY = ['list-conversations'];
export const DETAIL_CONVERSATION_KEY = ['detail-conversation'];

export function useCreateModel(): UseMutationResult<
  Model,
  CommandError,
  UnsavedModel
> {
  return useMutation({
    mutationFn: invokeCreateModel,
  });
}

export function useListModels(): UseQueryResult<Model[], CommandError> {
  return useQuery({
    queryKey: LIST_MODELS_KEY,
    queryFn: invokeListModels,
  });
}

export function useListSettings(): UseQueryResult<Setting[], CommandError> {
  return useQuery({
    queryKey: LIST_SETTINGS_KEY,
    queryFn: invokeListSettings,
  });
}

export function useUpsertSetting(): UseMutationResult<
  Setting,
  CommandError,
  Setting
> {
  return useMutation({
    mutationFn: invokeUpsertSetting,
  });
}

export function useCreateConversation(): UseMutationResult<
  Conversation,
  CommandError,
  UnsavedConversation
> {
  return useMutation({
    mutationFn: invokeCreateConversation,
  });
}

export function useListConversations(): UseQueryResult<
  Conversation[],
  CommandError
> {
  return useQuery({
    queryKey: LIST_CONVERSATIONS_KEY,
    queryFn: invokeListConversations,
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
