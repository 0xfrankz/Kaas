import type {
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
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
  invokeGetSysInfo,
  invokeGetSystemMessage,
  invokeHardDeleteMessage,
  invokeHardDeleteMessages,
  invokeListConversations,
  invokeListMessages,
  invokeListModels,
  invokeListPrompts,
  invokeListRemoteModels,
  invokeListSettings,
  invokeUpdateConversation,
  invokeUpdateConversationModel,
  invokeUpdateMessage,
  invokeUpdateModel,
  invokeUpdateOptions,
  invokeUpdatePrompt,
  invokeUpdateSubject,
  invokeUpsertSetting,
} from './commands';
import {
  MESSAGE_BOT,
  MESSAGE_USER,
  SETTING_NETWORK_PROXY,
  STREAM_DONE,
  STREAM_ERROR,
  STREAM_START,
  STREAM_STOPPED,
} from './constants';
import {
  ConversationsContext,
  FileUploaderContext,
  FilledPromptContext,
  MessageListContext,
} from './contexts';
import { proxySchema } from './schemas';
import { useAppStateStore } from './store';
import {
  type BotReply,
  type CommandError,
  type ConversationDetails,
  type GenericModel,
  type Message,
  type Model,
  type NewConversation,
  type NewMessage,
  type NewModel,
  type NewPrompt,
  type Options,
  type Prompt,
  type ProxySetting,
  type RawConfig,
  type RemoteModel,
  type Setting,
  type TConversationsContext,
  type TFileUploaderContext,
  type TFilledPromptContext,
  type TMessageListContext,
  toGenericConfig,
  type UpdateConversation,
} from './types';

export const LIST_MODELS_KEY = ['list-models'];
export const LIST_REMOTE_MODELS_KEY = ['list-remote-models'];
export const LIST_SETTINGS_KEY = ['list-settings'];
export const LIST_CONVERSATIONS_KEY = ['list-conversations'];
export const DETAIL_CONVERSATION_KEY = ['detail-conversation'];
export const OPTIONS_CONVERSATION_KEY = ['options-conversation'];
export const LIST_MESSAGES_KEY = ['list-messages'];
export const SYSTEM_MESSAGE_KEY = ['system-message'];
export const LIST_PROMPTS_KEY = ['list-prompts'];
export const SYS_INFO_KEY = ['sys-info'];

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

export function useListRemoteModelsQuery({
  config,
  ...options
}: Omit<
  UseQueryOptions<RemoteModel[], CommandError>,
  'queryKey' | 'queryFn'
> & {
  config: RawConfig;
}) {
  return useQuery({
    queryKey: LIST_REMOTE_MODELS_KEY,
    queryFn: () => invokeListRemoteModels(toGenericConfig(config)),
    ...options,
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
  onError: (
    error: CommandError,
    variables: Setting,
    context: unknown
  ) => void = () => {}
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

export function useGetSystemMessageQuery({
  conversationId,
  ...options
}: Omit<UseQueryOptions<Message, CommandError>, 'queryKey' | 'queryFn'> & {
  conversationId: number;
}): UseQueryResult<Message, CommandError> {
  return useQuery({
    queryKey: [...SYSTEM_MESSAGE_KEY, { conversationId }],
    queryFn: () => invokeGetSystemMessage(conversationId),
    ...options,
  });
}

export function useMessageCreator(
  options?: Omit<
    UseMutationOptions<Message, CommandError, NewMessage>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invokeCreateMessage,
    onSuccess: (msg) => {
      // Update cache
      if (msg.role === MESSAGE_USER) {
        // Add to list if it is a user message
        queryClient.setQueryData<Message[]>(
          [...LIST_MESSAGES_KEY, { conversationId: msg.conversationId }],
          (messages) => (messages ? [...messages, msg] : [msg])
        );
      } else if (msg.role === MESSAGE_BOT) {
        // Replace placeholder if it is a bot message
        queryClient.setQueryData<Message[]>(
          [...LIST_MESSAGES_KEY, { conversationId: msg.conversationId }],
          (messages) => {
            if (messages) {
              const lastMsg = messages.at(-1);
              if (lastMsg && lastMsg.id < 0) {
                // remove last placeholder message
                messages.pop();
              }
              return [...messages, msg];
            }
            return [msg];
          }
        );
      }
      // Move conversation to top of the list
      queryClient.setQueryData<ConversationDetails[]>(
        LIST_CONVERSATIONS_KEY,
        (old) =>
          produce(old, (draft) => {
            const index =
              draft?.findIndex((c) => c.id === msg.conversationId) ?? -1;
            if (index !== -1 && draft) {
              // Move to top
              draft.unshift(draft.splice(index, 1)[0]);
            }
          })
      );
    },
    ...options,
  }).mutate;
}

export function useMessageUpdater(
  options?: Omit<
    UseMutationOptions<Message, CommandError, Message>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invokeUpdateMessage,
    onSuccess: (msg) => {
      // Update cache
      if (msg.role === MESSAGE_BOT) {
        // Update existing bot message
        queryClient.setQueryData<Message[]>(
          [...LIST_MESSAGES_KEY, { conversationId: msg.conversationId }],
          (old) =>
            produce(old, (draft) => {
              const target = draft?.find((m) => m.id === msg.id);
              if (target) {
                target.content = msg.content;
                target.reasoning = msg.reasoning;
                target.updatedAt = msg.updatedAt;
                target.isReceiving = false;
                target.promptToken = msg.promptToken;
                target.completionToken = msg.completionToken;
                target.totalToken = msg.totalToken;
              }
            })
        );
      }
    },
    ...options,
  }).mutate;
}

export function useMessagesHardDeleter(
  options?: Omit<UseMutationOptions<void, CommandError, number>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: invokeHardDeleteMessages,
    ...options,
  }).mutate;
}

export function useMessageHardDeleter(
  options?: Omit<
    UseMutationOptions<Message, CommandError, Message>,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: invokeHardDeleteMessage,
    ...options,
  }).mutate;
}

export function useBotCaller(
  options?: Omit<
    UseMutationOptions<
      void,
      CommandError,
      {
        conversationId: number;
        tag: string;
        beforeMessageId?: number;
      }
    >,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: invokeCallBot,
    ...options,
  }).mutate;
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

export function useGetSysInfoQuery(): UseQueryResult<
  Record<string, string>,
  CommandError
> {
  return useQuery({
    queryKey: [SYS_INFO_KEY],
    queryFn: invokeGetSysInfo,
  });
}

type AnchorAttributesProps = Omit<HTMLAttributes<HTMLDivElement>, 'ref'>;
const Anchor = forwardRef<HTMLDivElement, AnchorAttributesProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} id="buttom-anchor" {...props} />
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
  containerRef: React.RefObject<HTMLDivElement>
): UseScrollToBottomResult {
  const toScrollRef = useRef<boolean>(true);
  const bottomScrollTopRef = useRef<number>(0);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Imperative function to scroll to anchor
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (toScrollRef.current && anchorRef.current) {
        anchorRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'end',
        });
      }
    }, 200);
  }, [anchorRef]);

  // 创建IntersectionObserver
  const observer = useMemo(() => {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // anchor enters viewport
            toScrollRef.current = false;
            bottomScrollTopRef.current = containerRef.current?.scrollTop ?? 0;
          } else if (
            containerRef.current?.scrollTop &&
            containerRef.current.scrollTop < bottomScrollTopRef.current
          ) {
            // element exits viewport because user scrolled up
            toScrollRef.current = false;
          } else {
            // element exits viewport and user didn't scroll up
            // upon initialization, this branch will auto scroll to bottom
            // by using a short delay, js can get the write position to scroll to
            toScrollRef.current = true;
            scrollToBottom();
          }
        });
      },
      {
        root: null,
        threshold: 0,
      }
    );
  }, [containerRef, scrollToBottom]);

  // Hook: attach observer && monitor scroll
  useEffect(() => {
    const el = anchorRef.current;
    if (el) {
      // Start oberserving for intersection
      observer.observe(el);
    } else {
      throw Error(
        "The Anchor element hasn't been mounted. Make sure the Anchor element returned by the hook is mounted in your scrolling container."
      );
    }
    return () => {
      // Release observer
      if (el) observer.unobserve(el);
    };
  }, [anchorRef, containerRef, observer]);

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

/**
 * Hook for receiving message from backend
 */
export function useReplyListener(tag: string) {
  const [ready, setReady] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [reply, setReply] = useState<BotReply | null>(null);
  const [error, setError] = useState<string>();
  const acceptingRef = useRef<boolean>(false);
  const listenerRef = useRef<UnlistenFn>();
  const mountedRef = useRef(false);

  const startStreaming = () => {
    setReceiving(true);
    acceptingRef.current = true;
    setReply(null);
  };

  const endStreaming = () => {
    setReceiving(false);
    acceptingRef.current = false;
  };

  const unbindListener = () => {
    if (listenerRef.current) {
      listenerRef.current();
      listenerRef.current = undefined;
    }
  };

  const bindListener = async () => {
    listenerRef.current = await listen<string>(tag, (event) => {
      const nextMsg = event.payload;
      switch (true) {
        case nextMsg === STREAM_START:
          startStreaming();
          break;
        case nextMsg === STREAM_DONE:
          endStreaming();
          break;
        case nextMsg === STREAM_STOPPED:
          endStreaming();
          break;
        case nextMsg.startsWith(STREAM_ERROR):
          setError(nextMsg.split(STREAM_ERROR).at(-1) ?? '');
          endStreaming();
          break;
        default:
          if (acceptingRef.current) {
            const botReply = JSON.parse(nextMsg) as BotReply;
            setReply((state) => {
              if (state) {
                // streaming mode, append to previous reply
                return {
                  ...state,
                  message: state.message + botReply.message,
                  reasoning:
                    (state.reasoning ?? '') + (botReply.reasoning ?? ''),
                  promptToken: botReply.promptToken,
                  completionToken: botReply.completionToken,
                  totalToken: botReply.totalToken,
                };
              }
              return botReply;
            });
          }
          break;
      }
    });
  };

  const mount = async () => {
    // stop bot when entering the page
    // in case it was left running before
    // await emit('stop-bot');
    await bindListener();
    setReady(true);
  };

  const unmount = () => {
    unbindListener();
    // stop bot when leaving the page
    // emit('stop-bot');
  };

  useEffect(() => {
    if (!mountedRef.current) {
      // when not mounted
      mount();
      mountedRef.current = true; // avoid binding listener twice in strict mode
    }
    return unmount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ready,
    receiving,
    reply,
    error,
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

export function useMessageListContext(): TMessageListContext {
  const context = useContext(MessageListContext);
  if (context === undefined) {
    throw new Error(
      'useMessageListContext must be used within a MessageListContextProvider'
    );
  }
  return context;
}

export function useFileUploaderContext(): TFileUploaderContext {
  const context = useContext(FileUploaderContext);
  if (context === undefined) {
    throw new Error(
      'useFileUploaderContext must be used within a FileUploaderContextProvider'
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
