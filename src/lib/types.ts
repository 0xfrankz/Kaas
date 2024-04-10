import type { z } from 'zod';

import type { SUPPORTED_PROVIDERS } from './constants';
import type {
  azureOptionsFormSchema,
  conversationFormSchema,
  editAzureModelFormSchema,
  editOpenAIModelFormSchema,
  newAzureModelFormSchema,
  newOpenAIModelFormSchema,
  openAIOptionsFormSchema,
  proxySchema,
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
export type NewAzureModel = z.infer<typeof newAzureModelFormSchema>;
export type AzureModel = z.infer<typeof editAzureModelFormSchema>;
export type NewOpenAIModel = z.infer<typeof newOpenAIModelFormSchema>;
export type OpenAIModel = z.infer<typeof editOpenAIModelFormSchema>;

export type NewModel = NewAzureModel | NewOpenAIModel;

export type GenericNewModel = {
  provider: string;
  config: string;
};

type SavedModelAttrs = {
  id: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type Model = NewModel & SavedModelAttrs;

export type GenericModel = GenericNewModel & SavedModelAttrs;

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

export type AzureOptions = z.infer<typeof azureOptionsFormSchema>;
export type OpenAIOptions = z.infer<typeof openAIOptionsFormSchema>;
export type Options = AzureOptions | OpenAIOptions;
export type ProviderOptions = {
  provider: string;
  options: string;
};

export type ProxySetting = z.infer<typeof proxySchema>;

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

export type ModelFormHandler = {
  reset: () => void;
};

// Functions
export function toGenericModel(model: NewModel): GenericNewModel {
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

export function fromGenericChatOptions(options: ProviderOptions): Options {
  const { provider, options: optionsStr } = options;
  return {
    provider,
    ...JSON.parse(optionsStr),
  };
}
