use async_openai::{
    config::{AzureConfig, Config}, types::{
        ChatCompletionRequestUserMessageArgs, ChatCompletionResponseStream, CreateChatCompletionRequestArgs
    }, Client
};
use entity::entities::{conversations::ProviderOptions, messages::Model as Message, models::{ProviderConfig, Providers}};
use entity::entities::models::Model;
use serde::Deserialize;

use crate::services::llm::utils::{model_to_azure_client, config_to_azure_client};

use super::utils::message_and_options_to_request;

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

pub async fn complete_chat(message: Message, options: ProviderOptions, config: ProviderConfig) -> Result<String, String> {
    let client;
    let request;
    match config.provider.as_str().into() {
        Providers::Azure => {
            client = config_to_azure_client(&config)?;
        },
        _ => {
            return Err("Complete chat with OpenAI not implemented yet".to_owned());
        }
    }
    request = message_and_options_to_request(&vec![message], &options)?;

    let response = client
        .chat()
        .create(request)
        .await
        .map_err(|_| String::from("Failed to get Azure chat completion response"))?;

    let choice = response
        .choices
        .first()
        .ok_or("Api returned empty choices".to_string())?;

    let message = choice
        .message
        .content
        .as_ref()
        .ok_or("Api returned empty message".to_string())?
        .to_string();

    Ok(message)
}

pub async fn complete_chat_stream(message: Message, options: ProviderOptions, config: ProviderConfig) -> Result<ChatCompletionResponseStream, String> {
    let client;
    let request;
    match config.provider.as_str().into() {
        Providers::Azure => {
            client = config_to_azure_client(&config)?;
        },
        _ => {
            return Err("Complete chat with OpenAI not implemented yet".to_owned());
        }
    }
    request = message_and_options_to_request(&vec![message], &options)?;

    let stream = client.chat().create_stream(request).await.map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
    Ok(stream)
}