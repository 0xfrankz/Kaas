import type {
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import type { HTMLAttributes } from 'react';
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useShallow } from 'zustand/react/shallow';

import {
  invokeCallBot,
  invokeCreateBlankConversation,
  invokeCreateConversation,
  invokeCreateMessage,
  invokeCreateModel,
  invokeCreatePrompt,
  invokeDeleteConversation,
  invokeDeleteModel,
  invokeDeletePrompt,
  invokeGetOptions,
  invokeListConversations,
  invokeListMessages,
  invokeListModels,
  invokeListPrompts,
  invokeListSettings,
  invokeUpdateConversation,
  invokeUpdateConversationModel,
  invokeUpdateModel,
  invokeUpdateOptions,
  invokeUpdatePrompt,
  invokeUpdateSubject,
  invokeUpsertSetting,
} from './commands';
import { SETTING_NETWORK_PROXY } from './constants';
import { ConversationsContext, FilledPromptContext } from './contexts';
import { proxySchema } from './schemas';
import { useAppStateStore } from './store';
import type {
  CommandError,
  ConversationDetails,
  GenericModel,
  Message,
  Model,
  NewConversation,
  NewMessage,
  NewModel,
  NewPrompt,
  Options,
  Prompt,
  ProxySetting,
  Setting,
  TConversationsContext,
  TFilledPromptContext,
  UpdateConversation,
} from './types';

export const LIST_MODELS_KEY = ['list-models'];
export const LIST_SETTINGS_KEY = ['list-settings'];
export const LIST_CONVERSATIONS_KEY = ['list-conversations'];
export const DETAIL_CONVERSATION_KEY = ['detail-conversation'];
export const OPTIONS_CONVERSATION_KEY = ['options-conversation'];
export const LIST_MESSAGES_KEY = ['list-messages'];
export const LIST_PROMPTS_KEY = ['list-prompts'];

export function useCreateModelMutation(): UseMutationResult<
  GenericModel,
  CommandError,
  NewModel
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

export function useModelUpdater(
  options?: Omit<UseMutationOptions<Model, CommandError, Model>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: invokeUpdateModel,
    ...options,
  }).mutate;
}

export function useModelDeleter(
  options?: Omit<UseMutationOptions<Model, CommandError, number>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: invokeDeleteModel,
    ...options,
  }).mutate;
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

export function useUpsertSettingMutation(
  options?: Omit<
    UseMutationOptions<Setting, CommandError, Setting>,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: invokeUpsertSetting,
    ...options,
  });
}

export function useSettingUpserter(
  onSuccess: () => void = () => {},
  onError: () => void = () => {}
) {
  const { updateSetting } = useAppStateStore();
  const upsertSettingMutation = useUpsertSettingMutation({
    onSuccess: (setting) => {
      updateSetting({ ...setting });
      onSuccess();
    },
    onError,
  });

  return upsertSettingMutation.mutate;
}

export function useCreateConversationMutation(): UseMutationResult<
  ConversationDetails,
  CommandError,
  NewConversation
> {
  return useMutation({
    mutationFn: invokeCreateConversation,
  });
}

export function useListConversationsQuery(): UseQueryResult<
  ConversationDetails[],
  CommandError
> {
  return useQuery({
    queryKey: LIST_CONVERSATIONS_KEY,
    queryFn: invokeListConversations,
  });
}

export function useConversationDeleter(
  options?: Omit<
    UseMutationOptions<ConversationDetails, CommandError, number>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invokeDeleteConversation,
    onSuccess: (conversation) => {
      // default onsucess behaviour
      queryClient.setQueryData<ConversationDetails[]>(
        LIST_CONVERSATIONS_KEY,
        (old) =>
          produce(old, (draft) => {
            return draft?.filter((p) => p.id !== conversation.id);
          })
      );
    },
    ...options,
  }).mutate;
}

export function useBlankConversationCreator(
  options?: Omit<
    UseMutationOptions<ConversationDetails, CommandError, string>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invokeCreateBlankConversation,
    onSuccess: () => {
      // default onsucess behaviour
      // invalid conversation list query
      queryClient.invalidateQueries({
        queryKey: LIST_CONVERSATIONS_KEY,
      });
    },
    ...options,
  }).mutate;
}

export function useConversationModelUpdater(
  options?: Omit<
    UseMutationOptions<
      ConversationDetails,
      CommandError,
      {
        conversationId: number;
        modelId: number;
      }
    >,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invokeUpdateConversationModel,
    onSuccess: (conversation) => {
      // default onsucess behaviour
      queryClient.setQueryData<ConversationDetails[]>(
        LIST_CONVERSATIONS_KEY,
        (old) =>
          produce(old, (draft) => {
            const index =
              draft?.findIndex((c) => c.id === conversation.id) ?? -1;
            if (index !== -1 && draft) {
              draft[index] = conversation;
            }
          })
      );
    },
    ...options,
  }).mutate;
}

export function useConversationUpdater(
  options?: Omit<
    UseMutationOptions<ConversationDetails, CommandError, UpdateConversation>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invokeUpdateConversation,
    onSuccess: (conversation) => {
      // default onsucess behaviour
      queryClient.setQueryData<ConversationDetails[]>(
        LIST_CONVERSATIONS_KEY,
        (old) =>
          produce(old, (draft) => {
            const index =
              draft?.findIndex((c) => c.id === conversation.id) ?? -1;
            if (index !== -1 && draft) {
              draft[index] = conversation;
            }
          })
      );
    },
    ...options,
  }).mutate;
}

export function useGetOptionsQuery(conversationId: number): {
  key: QueryKey;
  query: UseQueryResult<Options, CommandError>;
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

export function useCallBot(): UseMutationResult<void, CommandError, number> {
  return useMutation({
    mutationFn: invokeCallBot,
  });
}

export function useUpdateOptionsMutation(): UseMutationResult<
  void,
  CommandError,
  { conversationId: number; options: Options }
> {
  return useMutation({
    mutationFn: invokeUpdateOptions,
  });
}

export function useSubjectUpdater(
  onSuccess: () => void = () => {},
  onError: () => void = () => {}
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invokeUpdateSubject,
    onMutate: async ({ conversationId, subject }) => {
      // Snapshot the previous value
      const previousConversations = queryClient.getQueryData<
        ConversationDetails[]
      >(LIST_CONVERSATIONS_KEY);
      // Optimistically update
      queryClient.setQueryData<ConversationDetails[]>(
        LIST_CONVERSATIONS_KEY,
        (old) => {
          return produce(old, (draft) => {
            if (draft) {
              const conversation = draft.find((c) => c.id === conversationId);
              if (conversation) conversation.subject = subject;
            }
          });
        }
      );

      // Return a context object with the snapshotted value
      return { previousConversations };
    },
    onSuccess,
    onError,
  }).mutate;
}

export function usePromptCreator(
  options?: Omit<
    UseMutationOptions<Prompt, CommandError, NewPrompt>,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: invokeCreatePrompt,
    ...options,
  }).mutate;
}

export function useListPromptsQuery(): UseQueryResult<Prompt[], CommandError> {
  return useQuery({
    queryKey: LIST_PROMPTS_KEY,
    queryFn: invokeListPrompts,
  });
}

export function usePromptUpdater(
  options?: Omit<UseMutationOptions<Prompt, CommandError, Prompt>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: invokeUpdatePrompt,
    ...options,
  }).mutate;
}

export function usePromptDeleter(
  options?: Omit<UseMutationOptions<Prompt, CommandError, number>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: invokeDeletePrompt,
    ...options,
  }).mutate;
}

type AnchorAttributesProps = Omit<HTMLAttributes<HTMLDivElement>, 'ref'>;
const Anchor = forwardRef<HTMLDivElement, AnchorAttributesProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
);

type UseScrollToBottomResult = {
  Anchor: (props: AnchorAttributesProps) => React.JSX.Element;
  scrollToBottom: () => void;
};

/**
 * Hook used to automatically scroll to container's bottom
 * @param containerRef Ref to the scrolling container element
 * @param isSticky Whether the container should be automatically scrolled to bottom; will be false if user scrolls up from bottom manually
 * @returns
 */
export function useScrollToBottom(
  containerRef: React.RefObject<HTMLDivElement>,
  isSticky: boolean = true
): UseScrollToBottomResult {
  const [sticky, setSticky] = useState(isSticky);
  const bottomScrollTopRef = useRef<number>(0);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Imperative function to scroll to anchor
  const scrollToBottom = useCallback(() => {
    if (anchorRef.current) {
      anchorRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  }, [anchorRef]);

  // 创建IntersectionObserver
  const observer = useMemo(() => {
    return new IntersectionObserver(
      (entries) => {
        if (sticky) {
          entries.forEach((entry) => {
            // when anchor enters viewport
            if (entry.isIntersecting) {
              setSticky(true);
              bottomScrollTopRef.current = containerRef.current?.scrollTop ?? 0;
            } else if (
              containerRef.current?.scrollTop &&
              containerRef.current.scrollTop < bottomScrollTopRef.current
            ) {
              // element exits viewport and user scrolled up
              setSticky(false);
            } else {
              // element exits viewport and user didn't scroll up
              // up initialization, this branch will auto scroll to bottom
              // by using a short delay, js can get the write position to scroll to
              setTimeout(() => {
                if (sticky) {
                  scrollToBottom();
                  bottomScrollTopRef.current =
                    containerRef.current?.scrollTop ?? 0;
                }
              }, 100);
            }
          });
        }
      },
      {
        root: null,
        threshold: 0,
      }
    );
  }, [isSticky]);

  // Hook: attach observer && monitor scroll
  useEffect(() => {
    if (anchorRef.current) {
      // Start oberserving for intersection
      observer.observe(anchorRef.current);
    } else {
      throw Error(
        "The Anchor element hasn't been mounted. Make sure the Anchor element returned by the hook is mounted in your scrolling container."
      );
    }
    return () => {
      // Release observer
      if (anchorRef.current) observer.unobserve(anchorRef.current);
    };
  }, [anchorRef, containerRef]);

  // Anchor element with ref set
  const anchorEl = useMemo(() => {
    return (props: AnchorAttributesProps) => (
      <Anchor ref={anchorRef} {...props} />
    );
  }, []);

  return {
    scrollToBottom,
    Anchor: anchorEl,
  };
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

export function useFilledPromptContext(): TFilledPromptContext {
  const context = useContext(FilledPromptContext);
  if (context === undefined) {
    throw new Error(
      'useFilledPromptContext must be used within a FilledPromptContextProvider'
    );
  }
  return context;
}

// State hooks
export function useProxySetting(): [
  ProxySetting,
  (newProxySetting: ProxySetting) => void,
] {
  const [proxySettingStr, updateSetting] = useAppStateStore(
    useShallow((state) => [
      state.settings[SETTING_NETWORK_PROXY],
      state.updateSetting,
    ])
  );
  let proxySetting: ProxySetting;
  try {
    proxySetting = proxySchema.parse(JSON.parse(proxySettingStr));
  } catch (e) {
    proxySetting = {
      on: false,
      server: '',
      http: false,
      https: false,
    };
  }

  const setProxySetting = useCallback(
    (newProxySetting: ProxySetting) => {
      updateSetting({
        key: SETTING_NETWORK_PROXY,
        value: JSON.stringify(newProxySetting),
      });
    },
    [updateSetting]
  );

  return [proxySetting, setProxySetting];
}
