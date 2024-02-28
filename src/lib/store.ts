import { create } from 'zustand';

import type { Model, Setting } from './types';

export type AppState = {
  models: Model[];
  settings: Setting[];
  refreshModels: (models: Model[]) => void;
  setSettings: (settings: Setting[]) => void;
};

export const useAppStateStore = create<AppState>((set) => ({
  models: [],
  settings: [],
  refreshModels: (models: Model[]) => {
    set({ models });
  },
  setSettings: (settings: Setting[]) => {
    set({ settings });
  },
}));
