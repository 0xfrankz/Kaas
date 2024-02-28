import type { z } from 'zod';

import type { createModelSchema } from './schemas';

export type UnsavedModel = z.infer<typeof createModelSchema>;
export type Model = UnsavedModel & {
  id: string;
};

// Error
export type CommandError = {
  type: string;
  message: string;
};
