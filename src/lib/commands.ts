import { invoke } from '@tauri-apps/api';

import log from './log';
import type {
  Conversation,
  GenericModel,
  Message,
  Model,
  NewMessage,
  NewModel,
  NewPrompt,
  Options,
  Prompt,
  ProviderOptions,
  Setting,
  UnsavedConversation,
} from './types';
import {
  fromGenericChatOptions,
  fromGenericModel,
  toGenericModel,
} from './types';

export async function invokeCreateModel(
  model: NewModel
): Promise<GenericModel> {
  const genericModel = toGenericModel(model);
  const result = await invoke<GenericModel>('create_model', {
    model: genericModel,
  });
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

export async function invokeGetOptions(
  conversationId: number
): Promise<Options> {
  const result = await invoke<ProviderOptions>('get_options', {
    conversationId,
  });
  return fromGenericChatOptions(result);
}

export async function invokeUpdateOptions({
  conversationId,
  options,
}: {
  conversationId: number;
  options: Options;
}) {
  // Omit the Provider field
  const { provider: ignored, ...rest } = options;
  await invoke<ProviderOptions>('update_options', {
    conversationId,
    options: JSON.stringify(rest),
  });
}

export async function invokeUpdateSubject({
  conversationId,
  subject,
}: {
  conversationId: number;
  subject: string;
}) {
  await invoke<string>('update_subject', {
    conversationId,
    subject,
  });
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

export async function invokeCallBot(conversationId: number): Promise<void> {
  await invoke<Message>('call_bot', {
    conversationId,
  });
}

export async function invokeCreatePrompt(
  newPrompt: NewPrompt
): Promise<Prompt> {
  const result = await invoke<Prompt>('create_prompt', {
    newPrompt,
  });
  return result;
}
