use async_openai::{
    config::{AzureConfig, OpenAIConfig}, error::OpenAIError, types::{ChatCompletionRequestAssistantMessage, ChatCompletionRequestMessage, ChatCompletionRequestMessageContentPart, ChatCompletionRequestMessageContentPartImageArgs, ChatCompletionRequestMessageContentPartTextArgs, ChatCompletionRequestSystemMessage, ChatCompletionRequestUserMessage, ChatCompletionRequestUserMessageArgs, ChatCompletionRequestUserMessageContent, CreateChatCompletionRequest, CreateChatCompletionRequestArgs, ImageUrlArgs, ImageUrlDetail, Role}, Client
};
use entity::entities::{conversations::{AzureOptions, OpenAIOptions, Options, ProviderOptions}, messages::{ContentItem, MessageDTO, Model as Message, Roles}, models::{Model, ProviderConfig, Providers}};
use base64::{engine::general_purpose::STANDARD, Engine as _};

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
                    let part: ChatCompletionRequestMessageContentPart = match item {
                        ContentItem::Image{file_name, file_size, file_type, file_last_modified, file_data} => ChatCompletionRequestMessageContentPartImageArgs::default()
                            .image_url(
                                ImageUrlArgs::default()
                                    .url(STANDARD.encode(file_data))
                                    .detail(ImageUrlDetail::Auto)
                                    .build()?
                            )
                            .build()?
                            .into(),
                        ContentItem::Text{data} => ChatCompletionRequestMessageContentPartTextArgs::default()
                            .text(data.to_string())
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
                ChatCompletionRequestAssistantMessage {
                    content: message.get_text(),
                    role: Role::Assistant,
                    name: None,
                    tool_calls: None,
                    function_call: None,
                }
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

