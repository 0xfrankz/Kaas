import { z } from 'zod';

export const createModalSchema = z
  .object({
    apiKey: z.string().min(1, 'API Key is required'),
    endpoint: z.string().min(1, 'Endpoint is required'),
    deploymentId: z.string().min(1, 'Deployment ID is required'),
  })
  .required();
