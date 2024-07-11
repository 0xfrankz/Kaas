use async_openai::{
    error::OpenAIError, types::{ChatCompletionRequestAssistantMessage, ChatCompletionRequestAssistantMessageArgs, ChatCompletionRequestMessage, ChatCompletionRequestMessageContentPart, ChatCompletionRequestMessageContentPartImageArgs, ChatCompletionRequestMessageContentPartTextArgs, ChatCompletionRequestSystemMessage, ChatCompletionRequestUserMessage, ChatCompletionRequestUserMessageContent, CreateChatCompletionRequest, ImageDetail, ImageUrlArgs}
};
use entity::entities::{
    contents::ContentType, conversations::{AzureOptions, OpenAIOptions, ProviderOptions}, messages::{MessageDTO, Roles}, models::Providers
};

use crate::services::cache;

pub fn messages_and_options_to_request(messages: Vec<MessageDTO>, options: &ProviderOptions, default_max_tokens: Option<u32>) -> Result<CreateChatCompletionRequest, String> {
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
                                    .detail(ImageDetail::Auto)
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
                    name: None
                }
            );
        },
        Roles::System => {
            return ChatCompletionRequestMessage::System(
                ChatCompletionRequestSystemMessage {
                    content: message.get_text().unwrap_or(String::default()),
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

// An utility function that converts string of format BCP-47 with region subtag to format BCP-47 with script subtag
pub fn convert_locale_region_to_script(bcp47: &str) -> String {
    let mut bcp47 = bcp47.to_string();
    if bcp47.contains("-") {
        let parts: Vec<&str> = bcp47.split("-").collect();
        if parts.len() == 2 {
            let lang = parts[0].to_string();
            let region = parts[1].to_uppercase();
            if lang == "zh" {
                if region == "CN" || region == "SG" || region == "MY" {
                    // Simplified Chinese
                    bcp47 = format!("{}-Hans", lang);
                } else {
                    // Traditional Chinese
                    bcp47 = format!("{}-Hant", lang);
                }
            } else if lang == "en" {
                // use en for all English regions
                bcp47 = lang
            }
        }
    }
    bcp47
}

