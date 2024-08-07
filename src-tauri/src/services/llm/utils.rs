use async_openai::{
    error::OpenAIError, types::{ChatCompletionRequestAssistantMessage, ChatCompletionRequestAssistantMessageArgs, ChatCompletionRequestMessage, ChatCompletionRequestMessageContentPart, ChatCompletionRequestMessageContentPartImageArgs, ChatCompletionRequestMessageContentPartTextArgs, ChatCompletionRequestSystemMessage, ChatCompletionRequestUserMessage, ChatCompletionRequestUserMessageContent, ImageDetail, ImageUrlArgs}
};
use entity::entities::{
    contents::ContentType, conversations::{AzureOptions, OpenAIOptions, GenericOptions}, messages::{MessageDTO, Roles}, models::Providers, settings::ProxySetting
};

use crate::services::{cache, llm::chat::OllamaMessageContent};

use super::chat::{ClaudeAssistantMessage, ClaudeImageSource, ClaudeMessage, ClaudeMessageContentPart, ClaudeMessageContentPartImage, ClaudeMessageContentPartText, ClaudeRequestMessageContent, ClaudeUserMessage, OllamaMessage};

pub fn sum_option(a: Option<u32>, b: Option<u32>) -> Option<u32> {
    match (a, b) {
        (Some(x), Some(y)) => Some(x + y),
        (Some(x), None) => Some(x),
        (None, Some(y)) => Some(y),
        _ => None,
    }
}

pub fn message_to_openai_request_message(message: MessageDTO) -> ChatCompletionRequestMessage {
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

pub fn message_to_claude_request_message(message: MessageDTO) -> ClaudeMessage {
    let content_parts = message
        .content
        .into_iter()
        .map(|item| {
            let part: ClaudeMessageContentPart = match item.r#type {
                ContentType::Image => ClaudeMessageContentPart::Image(ClaudeMessageContentPartImage{
                    source: ClaudeImageSource {
                        r#type: "base64".to_string(),
                        media_type: item.mimetype.as_deref().unwrap_or("image/jpeg").to_string(),
                        data: cache::read_as_base64_with_mime(item.data.as_str(), item.mimetype.as_deref()).map(|r| r.1).unwrap_or(String::default())
                    }
                }),
                ContentType::Text => ClaudeMessageContentPart::Text(ClaudeMessageContentPartText{
                    text: item.data
                })
            };
            part
        })
        .collect::<Vec<ClaudeMessageContentPart>>();
    match message.role.into() {
        Roles::User => {
            return ClaudeMessage::User(ClaudeUserMessage {
                content: ClaudeRequestMessageContent::Array(content_parts)
            });
        },
        Roles::Bot => {
            return ClaudeMessage::Assistant(ClaudeAssistantMessage {
                content: ClaudeRequestMessageContent::Array(content_parts)
            });
        },
        _ => {panic!("Claude doesn't accept system message as part of context!")}
    }
}

pub fn message_to_ollama_request_message(message: MessageDTO) -> OllamaMessage {
    let mut content: OllamaMessageContent = OllamaMessageContent::default();

    message
        .content
        .into_iter()
        .for_each(|c| {
            match c.r#type {
                ContentType::Image => {
                    if content.images.is_none() {
                        content.images = Some(Vec::new());
                    }
                    content.images.as_mut().unwrap().push(cache::read_as_base64_with_mime(c.data.as_str(), c.mimetype.as_deref()).map(|r| r.1).unwrap_or(String::default()));
                },
                ContentType::Text => {
                    content.content = c.data;
                }
            }
        });
    match message.role.into() {
        Roles::User => {
            return OllamaMessage::User(content);
        },
        Roles::Bot => {
            return OllamaMessage::Assistant(content);
        },
        Roles::System => {
            return OllamaMessage::System(content);
        },
    }
}

pub fn is_stream_enabled(options: &GenericOptions) -> bool {
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

/// Build reqwest client with proxy
pub fn build_http_client(proxy_setting: Option<ProxySetting>) -> reqwest::Client {
    let proxy_option: Option<reqwest::Proxy> = if let Some(setting) = proxy_setting {
        if setting.on {
            let proxy_option = if setting.http && setting.https {
                reqwest::Proxy::all(setting.server).ok()
            } else if setting.http {
                reqwest::Proxy::http(setting.server).ok()
            } else {
                reqwest::Proxy::https(setting.server).ok()
            };
            if let Some(proxy) = proxy_option {
                if let (Some(username), Some(password)) = (setting.username, setting.password) {
                    Some(proxy
                        .basic_auth(username.as_str(), password.as_str())
                    )
                } else {
                    Some(proxy.to_owned())
                }
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    let mut http_client_builder = reqwest::Client::builder();
    if let Some(proxy) = proxy_option {
        http_client_builder = http_client_builder.proxy(proxy);
    }
    http_client_builder.build().unwrap_or(reqwest::Client::new())
}