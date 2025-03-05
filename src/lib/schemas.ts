import { z } from 'zod';

import {
  PROVIDER_AZURE,
  PROVIDER_CLAUDE,
  PROVIDER_CUSTOM,
  PROVIDER_DEEPSEEK,
  PROVIDER_OLLAMA,
  PROVIDER_OPENAI,
  PROVIDER_OPENROUTER,
  PROVIDER_XAI,
} from '@/lib/constants';

export const newOpenAIModelFormSchema = z.object({
  alias: z.string(),
  provider: z.enum([
    PROVIDER_OPENAI,
    PROVIDER_OPENROUTER,
    PROVIDER_DEEPSEEK,
    PROVIDER_XAI,
    PROVIDER_CUSTOM,
  ] as const),
  apiKey: z.string().min(1, 'API Key is required'),
  model: z.string().min(1, 'Model is required'),
  endpoint: z.string().url().optional(),
});

export const newAzureModelFormSchema = z.object({
  alias: z.string(),
  provider: z.literal(PROVIDER_AZURE),
  apiKey: z.string().min(1, 'API Key is required'),
  endpoint: z.string().min(1, 'Endpoint is required'),
  apiVersion: z.string().min(1, 'API version is required'),
  deploymentId: z.string().min(1, 'Deployment ID is required'),
});

export const newClaudeModelFormSchema = z.object({
  alias: z.string(),
  provider: z.literal(PROVIDER_CLAUDE),
  endpoint: z.string().optional(),
  apiKey: z.string().min(1, 'API Key is required'),
  model: z.string().min(1, 'Model is required'),
  apiVersion: z.string().min(1, 'API version is required'),
});

export const newOllamaModelFormSchema = z.object({
  alias: z.string(),
  provider: z.literal(PROVIDER_OLLAMA),
  endpoint: z.string().min(1, 'Endpoint is required'),
  model: z.string().min(1, 'Model is required'),
});

export const editAzureModelFormSchema = newAzureModelFormSchema.extend({
  id: z.number(),
});

export const editOpenAIModelFormSchema = newOpenAIModelFormSchema.extend({
  id: z.number(),
});

export const editClaudeModelFormSchema = newClaudeModelFormSchema.extend({
  id: z.number(),
});

export const editOllamaModelFormSchema = newOllamaModelFormSchema.extend({
  id: z.number(),
});

const commonOptionsFormSchema = z.object({
  contextLength: z.coerce.number().int().min(1).max(65535).optional(),
  frequencyPenalty: z.coerce
    .number()
    .min(-2.0)
    .max(2.0)
    .optional()
    .default(0)
    .refine(
      (value) => {
        const strValue = value.toString();
        const decimalPart = strValue.split('.')[1];
        return decimalPart ? decimalPart.length <= 2 : true;
      },
      {
        message: 'Only two decimal places are supported',
      }
    ),
  maxTokens: z.coerce
    .number()
    .int()
    .min(1)
    .max(2 ** 32 - 1)
    .optional(),
  // n: z.coerce.number().int().min(1).max(128).optional().default(1),
  presencePenalty: z.coerce
    .number()
    .min(-2.0)
    .max(2.0)
    .optional()
    .default(0)
    .refine(
      (value) => {
        const strValue = value.toString();
        const decimalPart = strValue.split('.')[1];
        return decimalPart ? decimalPart.length <= 2 : true;
      },
      {
        message: 'Only two decimal places are supported',
      }
    ),
  stream: z.boolean().optional().default(false),
  showReasoning: z.boolean().optional().default(false),
  temperature: z.coerce
    .number()
    .min(0)
    .max(2.0)
    .optional()
    .default(1)
    .refine(
      (value) => {
        const strValue = value.toString();
        const decimalPart = strValue.split('.')[1];
        return decimalPart ? decimalPart.length <= 2 : true;
      },
      {
        message: 'Only two decimal places are supported',
      }
    ),
  topP: z.coerce
    .number()
    .gt(0)
    .max(1.0)
    .optional()
    .default(1)
    .refine(
      (value) => {
        const strValue = value.toString();
        const decimalPart = strValue.split('.')[1];
        return decimalPart ? decimalPart.length <= 2 : true;
      },
      {
        message: 'Only two decimal places are supported',
      }
    ),
  user: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export const azureOptionsFormSchema = commonOptionsFormSchema.extend({
  provider: z.literal(PROVIDER_AZURE),
});

export const openAIOptionsFormSchema = commonOptionsFormSchema.extend({
  provider: z.enum([
    PROVIDER_OPENAI,
    PROVIDER_OPENROUTER,
    PROVIDER_XAI,
    PROVIDER_CUSTOM,
  ] as const),
});

export const deepseekOptionsFormSchema = commonOptionsFormSchema.extend({
  provider: z.enum([PROVIDER_DEEPSEEK] as const),
  maxTokens: z.coerce.number().int().min(1).max(8192).optional(),
});

export const claudeOptionsFormSchema = commonOptionsFormSchema
  .omit({
    frequencyPenalty: true,
    presencePenalty: true,
  })
  .extend({
    provider: z.literal(PROVIDER_CLAUDE),
  });

export const ollamaOptionsFormSchema = commonOptionsFormSchema
  .omit({
    frequencyPenalty: true,
    maxTokens: true,
    presencePenalty: true,
    user: true,
  })
  .extend({
    provider: z.literal(PROVIDER_OLLAMA),
    numCtx: z.coerce.number().optional(),
    numPredict: z.coerce.number().optional(),
  });

export const optionsFormSchema = z.discriminatedUnion('provider', [
  openAIOptionsFormSchema,
  azureOptionsFormSchema,
]);

export const conversationFormSchema = z.object({
  modelId: z.coerce.number(),
  message: z.string().min(1, 'Message is required'),
});

export const newPromptFormSchema = z.object({
  alias: z.string(),
  content: z.string(),
});

export const editPromptFormSchema = newPromptFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
});

export const usePromptFormSchema = z.object({
  prompt: z.string().optional().default(''),
  variables: z
    .array(
      z.object({
        label: z.string().optional().default(''),
        value: z.string().optional().default(''),
      })
    )
    .optional(),
});

export const proxySchema = z
  .object({
    on: z.boolean().optional().default(false),
    server: z
      .string()
      .min(1, { message: 'error:validation:empty-proxy-url' })
      .url({ message: 'error:validation:invalid-proxy-url' }),
    http: z.boolean().optional().default(false),
    https: z.boolean().optional().default(false),
    username: z.string().optional(),
    password: z.string().optional(),
  })
  .refine((data) => data.http || data.https, {
    message: 'error:validation:empty-traffic-type',
    path: ['http'],
  });
