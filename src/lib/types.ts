import type { z } from 'zod';

import type { SUPPORTED_PROVIDERS } from './constants';
import type { modelFormSchema } from './schemas';

type OpenAIConfig = {
  apiKey: string;
  model: string;
};

type AzureConfig = {
  apiKey: string;
  endpoint: string;
  deploymentId: string;
};

type ProviderConfig<T> = T extends 'OpenAI'
  ? OpenAIConfig
  : T extends 'Azure'
    ? AzureConfig
    : never;

export type Model<
  TProvider = SupportedProviders,
  TConfig = ProviderConfig<TProvider>,
> = {
  id: number;
  provider: TProvider;
  config: TConfig;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type UnsavedModel = z.infer<typeof modelFormSchema>;

export type Setting = {
  key: string;
  value: string;
};

export type SupportedProviders = (typeof SUPPORTED_PROVIDERS)[number];

// Error
export type CommandError = {
  type: string;
  message: string;
};
