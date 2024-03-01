import { z } from 'zod';

import { PROVIDER_AZURE, PROVIDER_OPENAI } from '@/lib/constants';

export const createModelSchema = z
  .object({
    apiKey: z.string().min(1, 'API Key is required'),
    endpoint: z.string().min(1, 'Endpoint is required'),
    deploymentId: z.string().min(1, 'Deployment ID is required'),
    provider: z.string(),
  })
  .required();

const openaiModelFormSchema = z.object({
  provider: z.literal(PROVIDER_OPENAI),
  apiKey: z.string().min(1, 'API Key is required'),
  model: z.string().min(1, 'Model is required'),
});

const azureModelFormSchema = z.object({
  provider: z.literal(PROVIDER_AZURE),
  apiKey: z.string().min(1, 'API Key is required'),
  endpoint: z.string().min(1, 'Endpoint is required'),
  deploymentId: z.string().min(1, 'Deployment ID is required'),
});

export const modelFormSchema = z.discriminatedUnion('provider', [
  openaiModelFormSchema,
  azureModelFormSchema,
]);
