import type { z } from 'zod';

import type { SUPPORTED_PROVIDERS } from './constants';
import type { modelFormSchema } from './schemas';

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

// Error
export type CommandError = {
  type: string;
  message: string;
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
