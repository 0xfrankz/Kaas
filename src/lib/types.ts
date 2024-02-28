import type { z } from 'zod';

import type { createModelSchema } from './schemas';

export type UnsavedModel = z.infer<typeof createModelSchema>;
export type Model = UnsavedModel & {
  id: string;
};

export type Setting = {
  key: string;
  value: string;
};

// Error
export type CommandError = {
  type: string;
  message: string;
};
