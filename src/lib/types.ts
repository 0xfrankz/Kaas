import type { z } from 'zod';

import type { createModelSchema } from './schemas';

export type Model = z.infer<typeof createModelSchema>;
export type UnsavedModel = z.infer<typeof createModelSchema>;

// Error
export type CommandError = {
  type: string;
  message: string;
};
