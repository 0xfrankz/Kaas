import { z } from 'zod';

import { PROVIDER_AZURE, PROVIDER_OPENAI } from '@/lib/constants';

// export const createModelSchema = z
//   .object({
//     apiKey: z.string().min(1, 'API Key is required'),
//     endpoint: z.string().min(1, 'Endpoint is required'),
//     deploymentId: z.string().min(1, 'Deployment ID is required'),
//     provider: z.string(),
//   })
//   .required();

export const newOpenAIModelFormSchema = z.object({
  provider: z.literal(PROVIDER_OPENAI),
  apiKey: z.string().min(1, 'API Key is required'),
  model: z.string().min(1, 'Model is required'),
});

export const newAzureModelFormSchema = z.object({
  provider: z.literal(PROVIDER_AZURE),
  apiKey: z.string().min(1, 'API Key is required'),
  endpoint: z.string().min(1, 'Endpoint is required'),
  apiVersion: z.string().min(1, 'API version is required'),
  deploymentId: z.string().min(1, 'Deployment ID is required'),
});

export const editAzureModelFormSchema = newAzureModelFormSchema.extend({
  id: z.number(),
});

export const editOpenAIModelFormSchema = newOpenAIModelFormSchema.extend({
  id: z.number(),
});

export const azureOptionsFormSchema = z.object({
  provider: z.literal(PROVIDER_AZURE),
  frequencyPenalty: z.coerce.number().optional().default(0),
  maxTokens: z.coerce.number().int().optional().default(16),
  n: z.coerce.number().int().optional().default(1),
  presencePenalty: z.coerce.number().optional().default(0),
  stream: z.boolean().optional().default(false),
  temperature: z.coerce.number().optional().default(1),
  topP: z.coerce.number().optional().default(1),
  user: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export const openAIOptionsFormSchema = z.object({
  provider: z.literal(PROVIDER_OPENAI),
  frequencyPenalty: z.number().optional().default(0),
});

export const optionsFormSchema = z.discriminatedUnion('provider', [
  openAIOptionsFormSchema,
  azureOptionsFormSchema,
]);

export const conversationFormSchema = z.object({
  modelId: z.coerce.number(),
  message: z.string().min(1, 'Message is required'),
});

export const proxySchema = z.object({
  on: z.boolean().optional().default(false),
  server: z.string().optional().default(''),
  http: z.boolean().optional().default(false),
  https: z.boolean().optional().default(false),
});
