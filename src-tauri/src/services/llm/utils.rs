use async_openai::{
    config::{AzureConfig, OpenAIConfig},
    types::{ChatCompletionRequestAssistantMessage, ChatCompletionRequestMessage, ChatCompletionRequestSystemMessage, ChatCompletionRequestUserMessage, ChatCompletionRequestUserMessageArgs, ChatCompletionRequestUserMessageContent, CreateChatCompletionRequest, CreateChatCompletionRequestArgs, Role},
    Client,
};
use entity::entities::{conversations::ProviderOptions, messages::{Model as Message, Roles}, models::{Model, ProviderConfig, Providers}};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawAzureConfig {
    api_key: String,
    endpoint: String,
    api_version: String,
    deployment_id: String,
}

impl Into<AzureConfig> for RawAzureConfig {
    fn into(self) -> AzureConfig {
        AzureConfig::new()
            .with_api_base(self.endpoint)
            .with_api_version(self.api_version)
            .with_deployment_id(self.deployment_id)
            .with_api_key(self.api_key)
    }
}

/**
 * Convert a Model entity to async_openai's Azure Client
 */
pub fn model_to_azure_client(model: &Model) -> Result<Client<AzureConfig>, String> {
    match model.provider.as_str().into() {
        Providers::Azure => {
            let config_json: RawAzureConfig = serde_json::from_str(&model.config)
                .map_err(|_| format!("Failed to parse model config: {}", &model.config))?;
            let config: AzureConfig = config_json.into();
            let client = Client::with_config(config);
            return Ok(client);
        },
        _ => {
            Err("Model is not an Azure model".to_owned())
        }
    }
}

/**
 * Convert a Model entity to async_openai's OpenAI Client
 */
pub fn model_to_openai_client(model: &Model) -> Result<Client<OpenAIConfig>, String> {
    match model.provider.as_str().into() {
        Providers::OpenAI => {
            return Ok(Client::new());
        },
        _ => {
            return Err("Model is not an OpenAI model".to_owned());
        }
    }
}

/**
 * Convert a ProviderConfig to async_openai's Azure Client
 */
pub fn config_to_azure_client(config: &ProviderConfig) -> Result<Client<AzureConfig>, String> {
    match config.provider.as_str().into() {
        Providers::Azure => {
            let config_json: RawAzureConfig = serde_json::from_str(&config.config)
                .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
            let config: AzureConfig = config_json.into();
            let client = Client::with_config(config);
            return Ok(client);
        },
        _ => {
            Err("Model is not an Azure model".to_owned())
        }
    }
}

/**
 * Convert a Model entity to async_openai's OpenAI Client
 */
pub fn config_to_openai_client(config: &ProviderConfig) -> Result<Client<OpenAIConfig>, String> {
    match config.provider.as_str().into() {
        Providers::OpenAI => {
            return Ok(Client::new());
        },
        _ => {
            return Err("Model is not an OpenAI model".to_owned());
        }
    }
}

pub fn message_and_options_to_request(messages: &Vec<Message>, options: &ProviderOptions) -> Result<CreateChatCompletionRequest, String> {
    let mut request_builder = CreateChatCompletionRequestArgs::default();
    // set messages
    let req_messages: Vec<ChatCompletionRequestMessage> = messages.iter().map(message_to_request_message).collect();
    request_builder.messages(req_messages);
    // set options
    match options.provider.as_str().into() {
        Providers::Azure => {
            todo!();
        },
        _ => {
            todo!();
        }
    }
    let request = request_builder
        .build()
        .map_err(|_| String::from("Failed to build Azure chat completion request"))?;
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
