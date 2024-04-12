use async_openai::{
    config::{AzureConfig, OpenAIConfig},
    types::{ChatCompletionRequestAssistantMessage, ChatCompletionRequestMessage, ChatCompletionRequestSystemMessage, ChatCompletionRequestUserMessage, ChatCompletionRequestUserMessageArgs, ChatCompletionRequestUserMessageContent, CreateChatCompletionRequest, CreateChatCompletionRequestArgs, Role},
    Client,
};
use entity::entities::{conversations::{AzureOptions, OpenAIOptions, Options, ProviderOptions}, messages::{Model as Message, Roles}, models::{Model, ProviderConfig, Providers}};
use serde::Deserialize;

// /**
//  * Convert a Model entity to async_openai's Azure Client
//  */
// pub fn model_to_azure_client(model: &Model) -> Result<Client<AzureConfig>, String> {
//     match model.provider.as_str().into() {
//         Providers::Azure => {
//             let config_json: RawAzureConfig = serde_json::from_str(&model.config)
//                 .map_err(|_| format!("Failed to parse model config: {}", &model.config))?;
//             let config: AzureConfig = config_json.into();
//             let client = Client::with_config(config);
//             return Ok(client);
//         },
//         _ => {
//             Err("Model is not an Azure model".to_owned())
//         }
//     }
// }

// /**
//  * Convert a Model entity to async_openai's OpenAI Client
//  */
// pub fn model_to_openai_client(model: &Model) -> Result<Client<OpenAIConfig>, String> {
//     match model.provider.as_str().into() {
//         Providers::OpenAI => {
//             let config_json: RawOpenAIConfig = serde_json::from_str(&model.config)
//                 .map_err(|_| format!("Failed to parse model config: {}", &model.config))?;
//             let config: OpenAIConfig = config_json.into();
//             let client = Client::with_config(config);
//             return Ok(client);
//         },
//         _ => {
//             return Err("Model is not an OpenAI model".to_owned());
//         }
//     }
// }

// /**
//  * Convert a ProviderConfig to async_openai's Azure Client
//  */
// pub fn config_to_azure_client(config: &ProviderConfig) -> Result<Client<AzureConfig>, String> {
//     let config_json: RawAzureConfig = serde_json::from_str(&config.config)
//         .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
//     let config: AzureConfig = config_json.into();
//     let client = Client::with_config(config);
//     return Ok(client);
// }

// /**
//  * Convert a Model entity to async_openai's OpenAI Client
//  */
// pub fn config_to_openai_client(config: &ProviderConfig) -> Result<Client<OpenAIConfig>, String> {
//     let config_json: RawOpenAIConfig = serde_json::from_str(&config.config)
//         .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
//     let config: OpenAIConfig = config_json.into();
//     let client = Client::with_config(config);
//     return Ok(client);
// }

pub fn message_and_options_to_request(messages: &Vec<Message>, options: &ProviderOptions) -> Result<CreateChatCompletionRequest, String> {
    // let mut request_builder = CreateChatCompletionRequestArgs::default();
    let request: CreateChatCompletionRequest;
    // set messages
    let req_messages: Vec<ChatCompletionRequestMessage> = messages.iter().map(message_to_request_message).collect();
    // request_builder.messages(req_messages);
    // set options
    match options.provider.as_str().into() {
        Providers::Azure => {
            let options: AzureOptions = serde_json::from_str(&options.options)
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

fn message_to_request_message(message: &Message) -> ChatCompletionRequestMessage {
    match message.role.into() {
        Roles::User => {
            return ChatCompletionRequestMessage::User(
                ChatCompletionRequestUserMessage {
                    content: ChatCompletionRequestUserMessageContent::Text(message.content.clone()),
                    role: Role::User,
                    name: None
                }
            );
        },
        Roles::System => {
            return ChatCompletionRequestMessage::System(
                ChatCompletionRequestSystemMessage {
                    content: message.content.clone(),
                    role: Role::System,
                    name: None
                }
            );
        },
        _ => {
            return ChatCompletionRequestMessage::Assistant(
                ChatCompletionRequestAssistantMessage {
                    content: Some(message.content.clone()),
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

