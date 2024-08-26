import type { z } from 'zod';

import type {
  ALL_PROVIDERS,
  CONTENT_ITEM_TYPES,
  PROVIDER_CUSTOM,
  PROVIDER_OLLAMA,
  PROVIDER_OPENAI,
  PROVIDER_OPENROUTER,
  SUPPORTED_PROVIDERS,
} from './constants';
import type {
  azureOptionsFormSchema,
  claudeOptionsFormSchema,
  conversationFormSchema,
  editAzureModelFormSchema,
  editClaudeModelFormSchema,
  editOllamaModelFormSchema,
  editOpenAIModelFormSchema,
  newAzureModelFormSchema,
  newClaudeModelFormSchema,
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

export type NewModel =
  | NewAzureModel
  | NewOpenAIModel
  | NewClaudeModel
  | NewOllamaModel;

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
    | typeof PROVIDER_CUSTOM;
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

export type RawConfig = RawOpenAIConfig | RawOllamaConfig;

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
  promptToken?: number;
  completionToken?: number;
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
  promptToken?: number;
  completionToken?: number;
  totalToken?: number;
};

export type AzureOptions = z.infer<typeof azureOptionsFormSchema>;
export type OpenAIOptions = z.infer<typeof openAIOptionsFormSchema>;
export type ClaudeOptions = z.infer<typeof claudeOptionsFormSchema>;
export type OllamaOptions = z.infer<typeof ollamaOptionsFormSchema>;
export type Options =
  | AzureOptions
  | OpenAIOptions
  | ClaudeOptions
  | OllamaOptions;
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
