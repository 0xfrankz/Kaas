import type { z } from 'zod';

import type {
  ALL_PROVIDERS,
  CONTENT_ITEM_TYPES,
  PROVIDER_CLAUDE,
  PROVIDER_CUSTOM,
  PROVIDER_DEEPSEEK,
  PROVIDER_GOOGLE,
  PROVIDER_OLLAMA,
  PROVIDER_OPENAI,
  PROVIDER_OPENROUTER,
  PROVIDER_XAI,
  SUPPORTED_PROVIDERS,
} from './constants';
import type {
  azureOptionsFormSchema,
  claudeOptionsFormSchema,
  conversationFormSchema,
  deepseekOptionsFormSchema,
  editAzureModelFormSchema,
  editClaudeModelFormSchema,
  editGoogleModelFormSchema,
  editOllamaModelFormSchema,
  editOpenAIModelFormSchema,
  newAzureModelFormSchema,
  newClaudeModelFormSchema,
  newGoogleModelFormSchema,
  newOllamaModelFormSchema,
  newOpenAIModelFormSchema,
  newPromptFormSchema,
  ollamaOptionsFormSchema,
  openAIOptionsFormSchema,
  proxySchema,
  usePromptFormSchema,
} from './schemas';

export type NewAzureModel = z.infer<typeof newAzureModelFormSchema>;
export type AzureModel = z.infer<typeof editAzureModelFormSchema>;
export type NewOpenAIModel = z.infer<typeof newOpenAIModelFormSchema>;
export type OpenAIModel = z.infer<typeof editOpenAIModelFormSchema>;
export type NewClaudeModel = z.infer<typeof newClaudeModelFormSchema>;
export type ClaudeModel = z.infer<typeof editClaudeModelFormSchema>;
export type NewOllamaModel = z.infer<typeof newOllamaModelFormSchema>;
export type OllamaModel = z.infer<typeof editOllamaModelFormSchema>;
export type NewGoogleModel = z.infer<typeof newGoogleModelFormSchema>;
export type GoogleModel = z.infer<typeof editGoogleModelFormSchema>;
export type NewModel =
  | NewAzureModel
  | NewOpenAIModel
  | NewClaudeModel
  | NewOllamaModel
  | NewGoogleModel;

export type RemoteModel = {
  id: string;
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

export type RawOpenAIConfig = {
  provider:
    | typeof PROVIDER_OPENAI
    | typeof PROVIDER_OPENROUTER
    | typeof PROVIDER_CUSTOM
    | typeof PROVIDER_DEEPSEEK
    | typeof PROVIDER_XAI;
  apiKey: string;
  model?: string;
  endpoint?: string;
  orgId?: string;
};

export type RawOllamaConfig = {
  provider: typeof PROVIDER_OLLAMA;
  endpoint: string;
  model?: string;
};

export type RawClaudeConfig = {
  provider: typeof PROVIDER_CLAUDE;
  apiKey: string;
  apiVersion: string;
  endpoint?: string;
};

export type RawGoogleConfig = {
  provider: typeof PROVIDER_GOOGLE;
  apiKey: string;
};

export type RawConfig =
  | RawOpenAIConfig
  | RawOllamaConfig
  | RawClaudeConfig
  | RawGoogleConfig;

export type GenericConfig = {
  provider: AllProviders;
  config: string;
};

export type Setting = {
  key: string;
  value: string;
};

export type AllProviders = (typeof ALL_PROVIDERS)[number];
export type SupportedProviders = (typeof SUPPORTED_PROVIDERS)[number];
export type ContentItemTypes = (typeof CONTENT_ITEM_TYPES)[number];

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
  lastMessageAt?: string;
  messageCount?: number;
  modelProvider?: AllProviders;
};

export type UpdateConversation = Omit<
  Conversation,
  'subject' | 'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  subject?: string;
};

export type ContentItem = {
  type: ContentItemTypes;
  mimetype?: string; // MIME type of the data
  data: string; // actual text if type === text, cache filename otherwise
};

export type NewMessage = {
  conversationId: number;
  role: number;
  content: ContentItem[];
  reasoning?: string;
  promptToken?: number;
  completionToken?: number;
  reasoningToken?: number;
  totalToken?: number;
};

export type Message = NewMessage & {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  modelId?: number;
  isReceiving?: boolean;
  isError?: boolean;
};

export type BotReply = {
  message: string;
  reasoning?: string;
  promptToken?: number;
  completionToken?: number;
  reasoningToken?: number;
  totalToken?: number;
};

export type AzureOptions = z.infer<typeof azureOptionsFormSchema>;
export type OpenAIOptions = z.infer<typeof openAIOptionsFormSchema>;
export type ClaudeOptions = z.infer<typeof claudeOptionsFormSchema>;
export type OllamaOptions = z.infer<typeof ollamaOptionsFormSchema>;
export type DeepseekOptions = z.infer<typeof deepseekOptionsFormSchema>;
export type Options =
  | AzureOptions
  | OpenAIOptions
  | ClaudeOptions
  | OllamaOptions
  | DeepseekOptions;
export type GenericOptions = {
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

export type FileData = {
  fileName: string;
  fileSize: number;
  fileType: string; // number of bytes
  fileData: Uint8Array; // blob
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
  onReceiverReady: () => void;
};

export type TFileUploaderContext = {
  files: FileData[];
  addFiles: (newFiles: FileData[]) => void;
  removeFile: (index: number) => void;
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

export type PromptInputHandler = {
  submit: () => void;
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

export function fromGenericChatOptions(options: GenericOptions): Options {
  const { provider, options: optionsStr } = options;
  return {
    provider,
    ...JSON.parse(optionsStr),
  };
}

export function toGenericConfig(config: RawConfig): GenericConfig {
  return {
    provider: config.provider,
    config: JSON.stringify(config),
  };
}
