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

const openaiModelFormSchema = z.object({
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
  openaiModelFormSchema,
  azureModelFormSchema,
]);

export const azureChatOptionsFormSchema = z.object({
  maxTokens: z.number().int().optional().default(16),
  temperature: z.number().optional().default(1),
  topP: z.number().optional().default(1),
  // logitBias: z.record(z.number()).optional(),
  user: z.string().optional(),
  // n: z.number().int().optional().default(1),
  stream: z.boolean().optional().default(false),
  logprobs: z.number().optional(),
  suffix: z.string().optional(),
  echo: z.boolean().optional().default(false),
  // stop: z.union([z.string(), z.array(z.string())]).optional(),
  presencePenalty: z.number().optional().default(0),
  frequencyPenalty: z.number().optional().default(0),
  // bestOf: z.number().int().optional().default(1),
});

export const conversationFormSchema = z.object({
  modelId: z.coerce.number(),
  message: z.string().min(1, 'Message is required'),
});
