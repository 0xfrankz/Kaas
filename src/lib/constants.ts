// Supported API providers
export const PROVIDER_OPENAI = 'OpenAI';
export const PROVIDER_AZURE = 'Azure';
export const SUPPORTED_PROVIDERS = [PROVIDER_OPENAI, PROVIDER_AZURE] as const;
export const PROVIDER_INFO = {
  [PROVIDER_OPENAI]: 'OpenAI',
  [PROVIDER_AZURE]: 'Microsoft Azure',
};

// Message types
export const MESSAGE_USER = 0;
export const MESSAGE_BOT = 1;
export const MESSAGE_SYSTEM = 2;

// Stream keywords
export const STREAM_START = '[[START]]';
export const STREAM_DONE = '[[DONE]]';
export const STREAM_ERROR = '[[ERROR]]';
export const STREAM_STOPPED = '[[STOPPED]]';

// Setting keys
export const KEY_SETTING_DEFAULT_MODEL = 'user:default:model';

// Defaults
export const DEFAULT_DATE_FORMAT = 'MMM D, YYYY';
