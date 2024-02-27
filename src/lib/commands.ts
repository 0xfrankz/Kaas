import { invoke } from '@tauri-apps/api';

import type { Model, UnsavedModel } from './types';

export async function invokeCreateModel(model: UnsavedModel): Promise<Model> {
  const result = await invoke<Model>('create_model', { model });
  return result;
}

export async function invokeListModels(): Promise<Model[]> {
  const result = await invoke<Model[]>('list_models');
  return result;
}
