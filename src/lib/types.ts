import type { z } from 'zod';

import type { SUPPORTED_PROVIDERS } from './constants';
import type {
  azureChatOptionsFormSchema,
  chatOptionsFormSchema,
  conversationFormSchema,
  modelFormSchema,
  openAIChatOptionsFormSchema,
} from './schemas';

// type OpenAIConfig = {
//   apiKey: string;
//   model: string;
// };

// type AzureConfig = {
//   apiKey: string;
//   endpoint: string;
//   deploymentId: string;
// };

// type ProviderConfig<T> = T extends 'OpenAI'
//   ? OpenAIConfig
//   : T extends 'Azure'
//     ? AzureConfig
//     : never;

// export type Model<
//   TProvider = SupportedProviders,
//   TConfig = ProviderConfig<TProvider>,
// > = {
//   id: number;
//   provider: TProvider;
//   config: TConfig;
//   createdAt: string;
//   updatedAt?: string;
//   deletedAt?: string;
// };

export type UnsavedModel = z.infer<typeof modelFormSchema>;

export type GenericUnsavedModel = {
  provider: string;
  config: string;
};

type SavedModelAttrs = {
  id: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type Model = UnsavedModel & SavedModelAttrs;

export type GenericModel = GenericUnsavedModel & SavedModelAttrs;

export type Setting = {
  key: string;
  value: string;
};

export type SupportedProviders = (typeof SUPPORTED_PROVIDERS)[number];

export type UnsavedConversation = z.infer<typeof conversationFormSchema>;

export type Conversation = {
  id: number;
  modelId: number;
  subject: string;
  options: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  messageCount?: number;
  modelProvider?: string;
};

export type NewMessage = {
  conversationId: number;
  role: number;
  content: string;
};

export type Message = NewMessage & {
  id: number;
  createdAt: string;
  deletedAt?: string;
};

export type AzureChatOptions = z.infer<typeof azureChatOptionsFormSchema>;
export type OpenAIChatOptions = z.infer<typeof openAIChatOptionsFormSchema>;
export type ChatOptions = z.infer<typeof chatOptionsFormSchema>;
export type GenericChatOptions = {
  provider: string;
  options: string;
};

// Contexts
export type TConversationsContext = {
  conversations: Conversation[];
  isLoading: boolean;
  get: (id: number) => Conversation | undefined;
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

// Functions
export function toGenericModel(model: UnsavedModel): GenericUnsavedModel {
  const { provider, ...config } = model;
  return {
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

export function fromGenericChatOptions(
  options: GenericChatOptions
): ChatOptions {
  const { provider, options: optionsStr } = options;
  return {
    provider,
    ...JSON.parse(optionsStr),
  };
}
