use async_openai::{
    config::{AzureConfig, Config, OpenAIConfig}, types::{
        ChatCompletionRequestUserMessageArgs, ChatCompletionResponseStream, CreateChatCompletionRequestArgs
    }, Client
};
use entity::entities::{conversations::ProviderOptions, messages::Model as Message, models::{ProviderConfig, Providers}};
use entity::entities::models::Model;
use serde::Deserialize;

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

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawOpenAIConfig {
    api_key: String,
    model: String,
    api_base: Option<String>,
    org_id: Option<String>,
}

impl Into<OpenAIConfig> for RawOpenAIConfig {
    fn into(self) -> OpenAIConfig {
        let mut config = OpenAIConfig::new()
            .with_api_key(self.api_key);
        if let Some(api_base) = self.api_base {
            config = config.with_api_base(api_base);
        }
        if let Some(org_id) = self.org_id {
            config = config.with_org_id(org_id);
        }

        return config;
    }
}

pub async fn complete_chat(message: Message, options: ProviderOptions, config: ProviderConfig) -> Result<String, String> {
    match config.provider.as_str().into() {
        Providers::Azure => {
            let config_json: RawAzureConfig = serde_json::from_str(&config.config)
                .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
            let config: AzureConfig = config_json.into();
            let client = Client::with_config(config);
            complete_chat_with_client(message, options, client).await
        },
        Providers::OpenAI => {
            let config_json: RawOpenAIConfig = serde_json::from_str(&config.config)
                .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
            let config: OpenAIConfig = config_json.into();
            let client = Client::with_config(config);
            complete_chat_with_client(message, options, client).await
        }
        _ => {
            return Err(format!("Complete chat with {} not implemented yet", config.provider));
        }
    }
}

async fn complete_chat_with_client<C: Config>(message: Message, options: ProviderOptions, client: Client<C>) -> Result<String, String> {
    let request = message_and_options_to_request(&vec![message], &options)?;

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
            let config_json: RawAzureConfig = serde_json::from_str(&config.config)
                .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
            let config: AzureConfig = config_json.into();
            client = Client::with_config(config);
        },
        _ => {
            return Err("Complete chat with OpenAI not implemented yet".to_owned());
        }
    }
    request = message_and_options_to_request(&vec![message], &options)?;

    let stream = client.chat().create_stream(request).await.map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
    Ok(stream)
}