use async_openai::{
    error::OpenAIError, types::{ChatCompletionRequestAssistantMessage, ChatCompletionRequestMessage, ChatCompletionRequestMessageContentPart, ChatCompletionRequestMessageContentPartImageArgs, ChatCompletionRequestMessageContentPartTextArgs, ChatCompletionRequestSystemMessage, ChatCompletionRequestUserMessage, ChatCompletionRequestUserMessageContent, CreateChatCompletionRequest, ImageUrlArgs, ImageUrlDetail, Role, ChatCompletionRequestAssistantMessageArgs}
};
use entity::entities::{
    contents::ContentType, conversations::{AzureOptions, OpenAIOptions, ProviderOptions}, messages::{MessageDTO, Roles}, models::Providers
};
use base64::{engine::general_purpose::STANDARD, Engine as _};

use crate::services::cache;

pub fn messages_and_options_to_request(messages: Vec<MessageDTO>, options: &ProviderOptions, default_max_tokens: Option<u16>) -> Result<CreateChatCompletionRequest, String> {
    // let mut request_builder = CreateChatCompletionRequestArgs::default();
    let request: CreateChatCompletionRequest;
    // set messages
    let req_messages: Vec<ChatCompletionRequestMessage> = messages.into_iter().map(message_to_request_message).collect();
    // request_builder.messages(req_messages);
    // set options
    match options.provider.as_str().into() {
        Providers::Azure => {
            let options: AzureOptions = serde_json::from_str(&options.options)
                .map_err(|_| format!("Failed to parse conversation options: {}", &options.options))?;
            request = CreateChatCompletionRequest {
                messages: req_messages,
                frequency_penalty: options.frequency_penalty,
                max_tokens: options.max_tokens.or(default_max_tokens),
                n: options.n,
                presence_penalty: options.presence_penalty,
                stream: options.stream,
                temperature: options.temperature,
                top_p: options.top_p,
                user: options.user,
                ..Default::default()
            };
        },
        _ => {
            let options: OpenAIOptions = serde_json::from_str(&options.options)
                .map_err(|_| format!("Failed to parse conversation options: {}", &options.options))?;
            request = CreateChatCompletionRequest {
                messages: req_messages,
                frequency_penalty: options.frequency_penalty,
                max_tokens: options.max_tokens,
                n: options.n,
                presence_penalty: options.presence_penalty,
                stream: options.stream,
                temperature: options.temperature,
                top_p: options.top_p,
                user: options.user,
                ..Default::default()
            };
        }
    }
    Ok(request)
}

fn message_to_request_message(message: MessageDTO) -> ChatCompletionRequestMessage {
    match message.role.into() {
        Roles::User => {
            let content_parts = message
                .content
                .into_iter()
                .map(|item| {
                    let part: ChatCompletionRequestMessageContentPart = match item.r#type {
                        ContentType::Image => ChatCompletionRequestMessageContentPartImageArgs::default()
                            .image_url(
                                ImageUrlArgs::default()
                                    .url(cache::read_as_data_url(item.data.as_str(), item.mimetype.as_deref()).unwrap_or(String::default()))
                                    .detail(ImageUrlDetail::Auto)
                                    .build()?
                            )
                            .build()?
                            .into(),
                        ContentType::Text => ChatCompletionRequestMessageContentPartTextArgs::default()
                            .text(item.data)
                            .build()?
                            .into()
                    };
                    Ok(part)
                })
                .collect::<Result<Vec<ChatCompletionRequestMessageContentPart>, OpenAIError>>()
                .expect("Failed to build user message content");
            return ChatCompletionRequestMessage::User(
                ChatCompletionRequestUserMessage {
                    content: ChatCompletionRequestUserMessageContent::Array(content_parts),
                    role: Role::User,
                    name: None
                }
            );
        },
        Roles::System => {
            return ChatCompletionRequestMessage::System(
                ChatCompletionRequestSystemMessage {
                    content: message.get_text().unwrap_or(String::default()),
                    role: Role::System,
                    name: None
                }
            );
        },
        _ => {
            return ChatCompletionRequestMessage::Assistant(
                ChatCompletionRequestAssistantMessageArgs::default()
                    .content(message.get_text().unwrap_or(String::default()))
                    .build()
                    .unwrap_or(ChatCompletionRequestAssistantMessage::default())
            );
        }
    }
}

pub fn is_stream_enabled(options: &ProviderOptions) -> bool {
    match options.provider.as_str().into() {
        Providers::Azure => {
            if let Ok(azure_options) = serde_json::from_str::<AzureOptions>(&options.options) {
                return azure_options.stream.unwrap_or(false);
            } else {
                return false;
            }
        },
        _ => {
            if let Ok(openai_options) = serde_json::from_str::<OpenAIOptions>(&options.options) {
                return openai_options.stream.unwrap_or(false);
            } else {
                return false;
            }
        }
    }
}

