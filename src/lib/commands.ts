import { invoke } from '@tauri-apps/api';

import log from './log';
import type {
  Conversation,
  ConversationDetails,
  GenericModel,
  Message,
  Model,
  NewConversation,
  NewMessage,
  NewModel,
  NewPrompt,
  Options,
  Prompt,
  ProviderOptions,
  Setting,
  UpdateConversation,
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
    newModel: genericModel,
  });
  return result;
}

export async function invokeListModels(): Promise<Model[]> {
  const result = await invoke<GenericModel[]>('list_models');
  return result.map(fromGenericModel);
}

export async function invokeUpdateModel(model: Model): Promise<Model> {
  const genericModel = toGenericModel(model);
  const result = await invoke<GenericModel>('update_model', {
    model: genericModel,
  });
  return fromGenericModel(result);
}

export async function invokeDeleteModel(modelId: number): Promise<Model> {
  const result = await invoke<GenericModel>('delete_model', {
    modelId,
  });
  return fromGenericModel(result);
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
  newConversation: NewConversation
): Promise<Conversation> {
  const result = await invoke<Conversation>('create_conversation', {
    newConversation,
  });
  return result;
}

export async function invokeCreateBlankConversation(
  subject: string
): Promise<Conversation> {
  const blankConversation = {
    id: 0,
    subject,
  };
  const result = await invoke<Conversation>('create_blank_conversation', {
    blankConversation,
  });
  return result;
}

export async function invokeListConversations(): Promise<
  ConversationDetails[]
> {
  const result = await invoke<ConversationDetails[]>('list_conversations');
  log.info(`[FE]list_conversations result: ${JSON.stringify(result)}`);
  return result;
}

export async function invokeDeleteConversation(
  conversationId: number
): Promise<Conversation> {
  const result = await invoke<Conversation>('delete_conversation', {
    conversationId,
  });
  return result;
}

export async function invokeUpdateConversationModel({
  conversationId,
  modelId,
}: {
  conversationId: number;
  modelId: number;
}): Promise<ConversationDetails> {
  const result = await invoke<ConversationDetails>(
    'update_conversation_model',
    {
      conversationId,
      modelId,
    }
  );
  return result;
}

export async function invokeUpdateConversation(
  conversation: UpdateConversation
): Promise<ConversationDetails> {
  const result = await invoke<ConversationDetails>('update_conversation', {
    conversation,
  });
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

export async function invokeListPrompts(): Promise<Prompt[]> {
  const result = await invoke<Prompt[]>('list_prompts');
  return result;
}

export async function invokeUpdatePrompt(prompt: Prompt): Promise<Prompt> {
  const result = await invoke<Prompt>('update_prompt', { prompt });
  return result;
}

export async function invokeDeletePrompt(promptId: number): Promise<Prompt> {
  const result = await invoke<Prompt>('delete_prompt', { promptId });
  return result;
}
