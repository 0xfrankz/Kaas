import type { z } from 'zod';

import type { createModalSchema } from './schemas';

export type Model = z.infer<typeof createModalSchema>;
export type UnsavedModel = z.infer<typeof createModalSchema>;

// Error
export type CommandError = {
  type: string;
  message: string;
};
