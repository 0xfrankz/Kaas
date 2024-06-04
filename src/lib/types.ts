import type { z } from 'zod';

import type { ALL_PROVIDERS, SUPPORTED_PROVIDERS } from './constants';
import type {
  azureOptionsFormSchema,
  conversationFormSchema,
  editAzureModelFormSchema,
  editOpenAIModelFormSchema,
  newAzureModelFormSchema,
  newOpenAIModelFormSchema,
  newPromptFormSchema,
  openAIOptionsFormSchema,
  proxySchema,
  usePromptFormSchema,
} from './schemas';

export type NewAzureModel = z.infer<typeof newAzureModelFormSchema>;
export type AzureModel = z.infer<typeof editAzureModelFormSchema>;
export type NewOpenAIModel = z.infer<typeof newOpenAIModelFormSchema>;
export type OpenAIModel = z.infer<typeof editOpenAIModelFormSchema>;

export type NewModel = NewAzureModel | NewOpenAIModel;

export type RemoteModel = {
  id: string;
  created: number;
  object: string;
  owned_by: string;
};

type SavedModelAttrs = {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type Model = NewModel & SavedModelAttrs;

export type GenericModel = {
  alias: string;
  provider: AllProviders;
  config: string;
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type Setting = {
  key: string;
  value: string;
};

export type AllProviders = (typeof ALL_PROVIDERS)[number];
export type SupportedProviders = (typeof SUPPORTED_PROVIDERS)[number];

export type NewConversation = z.infer<typeof conversationFormSchema>;

export type Conversation = {
  id: number;
  modelId?: number;
  subject: string;
  options?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type ConversationDetails = {
  id: number;
  modelId?: number;
  subject: string;
  options?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  messageCount?: number;
  modelProvider?: AllProviders;
};

export type UpdateConversation = Omit<
  Conversation,
  'subject' | 'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  subject?: string;
};

export type NewMessage = {
  conversationId: number;
  role: number;
  content: string;
};

export type Message = NewMessage & {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  modelId?: number;
  receiving?: boolean;
};

export type AzureOptions = z.infer<typeof azureOptionsFormSchema>;
export type OpenAIOptions = z.infer<typeof openAIOptionsFormSchema>;
export type Options = AzureOptions | OpenAIOptions;
export type ProviderOptions = {
  provider: AllProviders;
  options: string;
};

export type NewPrompt = z.infer<typeof newPromptFormSchema>;

export type Prompt = NewPrompt & {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type FilledPrompt = z.infer<typeof usePromptFormSchema>;

export type ProxySetting = z.infer<typeof proxySchema>;

export type ProviderStyles = {
  icon: {
    light: string;
    dark: string;
  };
  color: {
    light: string;
    dark: string;
  };
};

// Contexts
export type TConversationsContext = {
  conversations: ConversationDetails[];
  isLoading: boolean;
  get: (id: number) => ConversationDetails | undefined;
};

export type TFilledPromptContext = {
  prompt: FilledPrompt;
  setPrompt: (prompt: FilledPrompt) => void;
};

export type TMessageListContext = {
  messages: Message[];
  onRegenerateClick: (message: Message) => void;
  onMessageReceived: (message: Message) => void;
  onReceiverReady: () => void;
};

// Errors
export type CommandError = {
  type: string;
  message: string;
};

// Imperative handlers
export type FormHandler = {
  reset: () => void;
};

export type ModelFormHandler = {
  reset: () => void;
};

export type DialogHandler<T> = {
  open: (defaultValue?: T) => void;
  close: () => void;
};

export type StatefulDialogHandler<T> = DialogHandler<T> & {
  isOpen: () => boolean;
};

// Functions
export function toGenericModel(model: NewModel | Model): GenericModel {
  if ('id' in model) {
    const { id, alias, provider, ...config } = model;
    return {
      id,
      alias,
      provider,
      config: JSON.stringify(config),
    };
  }
  const { alias, provider, ...config } = model;
  return {
    alias,
    provider,
    config: JSON.stringify(config),
  };
}

export function fromGenericModel(model: GenericModel): Model {
  const { config, ...rest } = model;
  const configObj = JSON.parse(config);
  return {
    ...configObj,
    ...rest,
  };
}

export function fromGenericChatOptions(options: ProviderOptions): Options {
  const { provider, options: optionsStr } = options;
  return {
    provider,
    ...JSON.parse(optionsStr),
  };
}
