// Supported API providers
export const PROVIDER_OPENAI = 'OpenAI';
export const PROVIDER_AZURE = 'Azure';
export const SUPPORTED_PROVIDERS = [PROVIDER_OPENAI, PROVIDER_AZURE] as const;
export const PROVIDER_INFO = {
  [PROVIDER_OPENAI]: 'OpenAI',
  [PROVIDER_AZURE]: 'Microsoft Azure',
};

// Setting keys
export const KEY_SETTING_DEFAULT_MODEL = 'user:default:model';

// Defaults
export const DEFAULT_DATE_FORMAT = 'MMM D, YYYY';
