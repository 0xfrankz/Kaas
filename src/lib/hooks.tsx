import type {
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
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

export function useUpsertSettingMutation(
  options: Omit<
    UseMutationOptions<Setting, CommandError, Setting>,
    'mutationFn'
  >
) {
  return useMutation({
    mutationFn: invokeUpsertSetting,
    ...options,
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

export function useCallBot(): UseMutationResult<void, CommandError, number> {
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
        root: null, // 相对于哪个元素开始监视，null表示文档视口
        threshold: 0, // 交叉比例达到多少时执行回调函数，0表示完全不可见时执行
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
