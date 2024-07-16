import { create } from 'zustand';

import { SETTING_USER_DEFAULT_MODEL } from './constants';
import type { Model, Setting } from './types';

export type AppState = {
  models: Model[];
  settings: Record<string, string>;
  setModels: (models: Model[]) => void;
  setSettings: (settings: Setting[]) => void;
  updateSetting: (setting: Setting) => void;
  getDefaultModel: () => Model | undefined;
};

type ConfirmationData = {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export type ConfirmationState = {
  data?: ConfirmationData;
  open: (data: ConfirmationData) => void;
  close: () => void;
};

export const useAppStateStore = create<AppState>()((set, get) => ({
  models: [],
  settings: {},
  setModels: (models: Model[]) => {
    set({ models });
  },
  setSettings: (settings: Setting[]) => {
    set(() => {
      const result: Record<string, string> = {};
      settings.forEach((setting) => {
        result[setting.key] = setting.value;
      });
      return { settings: result };
    });
  },
  updateSetting: (setting: Setting) => {
    set((state) => {
      return {
        settings: { ...state.settings, [setting.key]: setting.value },
      };
    });
  },
  getDefaultModel: () => {
    const defaultModelId = parseInt(
      get().settings[SETTING_USER_DEFAULT_MODEL],
      10
    );
    const defaultModel = get().models.find(
      (model) => model.id === defaultModelId
    );
    return defaultModel ?? get().models[0];
  },
}));

export const useConfirmationStateStore = create<ConfirmationState>()((set) => ({
  data: undefined,
  open: (data) => set({ data }),
  close: () => set({ data: undefined }),
}));
