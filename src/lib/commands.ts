import { invoke } from '@tauri-apps/api';

import type { GenericModel, Model, Setting, UnsavedModel } from './types';
import { fromGenericModel, toGenericModel } from './types';

export async function invokeCreateModel(model: UnsavedModel): Promise<Model> {
  const genericModel = toGenericModel(model);
  const result = await invoke<Model>('create_model', { model: genericModel });
  return result;
}

export async function invokeListModels(): Promise<Model[]> {
  const result = await invoke<GenericModel[]>('list_models');
  return result.map(fromGenericModel);
}

export async function invokeListSettings(): Promise<Setting[]> {
  const result = await invoke<Setting[]>('list_settings');
  return result;
}

export async function invokeUpsertSetting(setting: Setting): Promise<Setting> {
  const result = await invoke<Setting>('upsert_setting', { setting });
  return result;
}
