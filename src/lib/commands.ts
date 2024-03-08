import { invoke } from '@tauri-apps/api';

import log from './log';
import type {
  Conversation,
  GenericModel,
  Message,
  Model,
  NewMessage,
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
  newConversation: UnsavedConversation
): Promise<Conversation> {
  log.info(
    `[FE]invokeCreateConversation data: ${JSON.stringify(newConversation)}`
  );
  const result = await invoke<Conversation>('create_conversation', {
    newConversation,
  });
  return result;
}

export async function invokeListConversations(): Promise<Conversation[]> {
  const result = await invoke<Conversation[]>('list_conversations');
  log.info(`[FE]list_conversations result: ${JSON.stringify(result)}`);
  return result;
}

export async function invokeListMessages(
  conversationId: number
): Promise<Message[]> {
  const result = await invoke<Message[]>('list_messages', { conversationId });
  return result;
}

export async function invokeCreateMessage(
  message: NewMessage
): Promise<Message> {
  const result = await invoke<Message>('create_message', { message });
  return result;
}
