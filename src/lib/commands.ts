import { invoke } from '@tauri-apps/api';

import { AppError } from './error';
import log from './log';
import type {
  CommandError,
  Conversation,
  GenericModel,
  Model,
  Setting,
  UnsavedConversation,
  UnsavedModel,
} from './types';
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

export async function invokeCreateConversation(
  conversation: UnsavedConversation
): Promise<Conversation> {
  const data: Record<string, string | number> = {
    modelId: conversation.modelId,
    subject: conversation.message,
  };
  log.info(`create_conversation with data: ${JSON.stringify(data)}`);
  const result = await invoke<Conversation>('create_conversation', {
    conversation: data,
  });
  return result;
}

export async function invokeListConversations(): Promise<Conversation[]> {
  const result = await invoke<Conversation[]>('list_conversations');
  log.info(`[FE]list_conversations result: ${JSON.stringify(result)}`);
  return result;
}

export async function invokeGetConversation(
  conversationId: number
): Promise<Conversation> {
  const result = await invoke<Conversation>('get_conversation', {
    conversationId,
  }).catch((err: CommandError) => {
    return Promise.reject(
      new AppError(
        err.type,
        err.message,
        `Oops, the conversation with id = ${conversationId} is missing...`
      )
    );
  });

  return result;
}
