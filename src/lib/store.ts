import { create } from 'zustand';

import type { Model, Setting } from './types';

export type AppState = {
  models: Model[];
  settings: Record<string, string>;
  refreshModels: (models: Model[]) => void;
  setSettings: (settings: Setting[]) => void;
  updateSetting: (setting: Setting) => void;
};

export const useAppStateStore = create<AppState>()((set) => ({
  models: [],
  settings: {},
  refreshModels: (models: Model[]) => {
    set({ models });
  },
  setSettings: (settings: Setting[]) => {
    set(() => {
      const result: Record<string, string> = {};
      settings.forEach((setting) => {
        result[setting.key] = setting.value;
      });
      return result;
    });
  },
  updateSetting: (setting: Setting) =>
    set((state) => {
      return {
        settings: { ...state.settings, [setting.key]: setting.value },
      };
    }),
}));
