// Type related constants
export const PROVIDER_OPENAI = 'OpenAI';
export const PROVIDER_AZURE = 'Azure';
export const PROVIDER_CLAUDE = 'Claude';
export const PROVIDER_OLLAMA = 'Ollama';
export const PROVIDER_UNKNOWN = 'Unknown';
export const SUPPORTED_PROVIDERS = [
  PROVIDER_OPENAI,
  PROVIDER_AZURE,
  PROVIDER_CLAUDE,
  PROVIDER_OLLAMA,
] as const;
export const ALL_PROVIDERS = [
  ...SUPPORTED_PROVIDERS,
  PROVIDER_UNKNOWN,
] as const;
export const PROVIDER_INFO = {
  [PROVIDER_OPENAI]: 'OpenAI',
  [PROVIDER_AZURE]: 'Microsoft Azure',
  [PROVIDER_CLAUDE]: 'Anthropic Claude',
};
export const PROVIDER_STYLES = {
  [PROVIDER_OPENAI]: {
    icon: {
      light: 'oai_logo.svg',
      dark: 'oai_logo.svg',
    },
    color: {
      light: '#C2DCD3',
      dark: '#348B6B',
    },
  },
  [PROVIDER_AZURE]: {
    icon: {
      light: 'azure_logo.svg',
      dark: 'azure_logo.svg',
    },
    color: {
      light: '#CCE4F6',
      dark: '#0078D4',
    },
  },
  [PROVIDER_CLAUDE]: {
    icon: {
      light: 'claude_logo.svg',
      dark: 'claude_logo.svg',
    },
    color: {
      light: '#F4D6CD',
      dark: '#D97757',
    },
  },
  [PROVIDER_OLLAMA]: {
    icon: {
      light: 'ollama_logo_b.svg',
      dark: 'ollama_logo_w.svg',
    },
    color: {
      light: '#EEEEEE',
      dark: '#999999',
    },
  },
  [PROVIDER_UNKNOWN]: {
    icon: {
      light: 'unknown_logo_b.svg',
      dark: 'unknown_logo_w.svg',
    },
    color: {
      light: '#CCCCCC',
      dark: '#CCCCCC',
    },
  },
};

// Message types
export const MESSAGE_USER = 0;
export const MESSAGE_BOT = 1;
export const MESSAGE_SYSTEM = 2;

// Message content item type
export const CONTENT_ITEM_TYPE_TEXT = 0;
export const CONTENT_ITEM_TYPE_IMAGE = 1;
export const CONTENT_ITEM_TYPES = [
  CONTENT_ITEM_TYPE_TEXT,
  CONTENT_ITEM_TYPE_IMAGE,
] as const;

// Stream keywords
export const STREAM_START = '[[START]]';
export const STREAM_DONE = '[[DONE]]';
export const STREAM_ERROR = '[[ERROR]]';
export const STREAM_STOPPED = '[[STOPPED]]';

// Setting keys
export const SETTING_USER_DEFAULT_MODEL = 'user:default_model';
export const SETTING_USER_ENTER_TO_SEND = 'user:enter_to_send';
export const SETTING_DISPLAY_LANGUAGE = 'display:language';
export const SETTING_DISPLAY_THEME = 'display:darkmode';
export const SETTING_PROFILE_NAME = 'profile:name';
export const SETTING_MODELS_CONTEXT_LENGTH = 'models:context_length';
export const SETTING_MODELS_MAX_TOKENS = 'models:max_tokens';
export const SETTING_NETWORK_PROXY = 'network:proxy';

// Defaults
export const DEFAULT_DATE_FORMAT = 'MMM D, YYYY';
export const DEFAULT_DATETIME_FORMAT = 'HH:mm MMM D, YYYY';
export const DEFAULT_PROFILE_NAME = 'ME';
export const DEFAULT_CONTEXT_LENGTH = 1;
export const DEFAULT_MAX_TOKENS = 256;

// Constatns
export const MAX_NUM_OF_UPLOAD_FILES = 10;
