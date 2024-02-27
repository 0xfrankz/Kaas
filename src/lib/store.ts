import { create } from 'zustand';

import type { Model } from './types';

export type AppState = {
  models: Model[];
  refreshModels: (models: Model[]) => void;
};

export const useAppStateStore = create<AppState>((set) => ({
  models: [],
  refreshModels: (models: Model[]) => {
    set({ models });
  },
}));
