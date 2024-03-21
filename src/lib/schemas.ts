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

const openAIModelFormSchema = z.object({
  provider: z.literal(PROVIDER_OPENAI),
  apiKey: z.string().min(1, 'API Key is required'),
  model: z.string().min(1, 'Model is required'),
});

const azureModelFormSchema = z.object({
  provider: z.literal(PROVIDER_AZURE),
  apiKey: z.string().min(1, 'API Key is required'),
  endpoint: z.string().min(1, 'Endpoint is required'),
  apiVersion: z.string().min(1, 'API version is required'),
  deploymentId: z.string().min(1, 'Deployment ID is required'),
});

export const modelFormSchema = z.discriminatedUnion('provider', [
  openAIModelFormSchema,
  azureModelFormSchema,
]);

export const azureChatOptionsFormSchema = z.object({
  provider: z.literal(PROVIDER_AZURE),
  frequencyPenalty: z.number().optional().default(0),
  maxTokens: z.number().int().optional().default(16),
  n: z.number().int().optional().default(1),
  presencePenalty: z.number().optional().default(0),
  stream: z.boolean().optional().default(false),
  temperature: z.number().optional().default(1),
  topP: z.number().optional().default(1),
  user: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export const openAIChatOptionsFormSchema = z.object({
  provider: z.literal(PROVIDER_OPENAI),
  frequencyPenalty: z.number().optional().default(0),
});

export const chatOptionsFormSchema = z.discriminatedUnion('provider', [
  openAIChatOptionsFormSchema,
  azureChatOptionsFormSchema,
]);

export const conversationFormSchema = z.object({
  modelId: z.coerce.number(),
  message: z.string().min(1, 'Message is required'),
});
