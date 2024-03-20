use async_openai::{
    config::{AzureConfig, Config, OpenAIConfig},
    types::{
        ChatCompletionRequestUserMessageArgs, ChatCompletionResponseFormat, CreateChatCompletionRequest, CreateChatCompletionRequestArgs, Stop
    },
    Client,
};
use entity::entities::{conversations::Model as Conversation, models::{Model, Providers}};
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
 * Convert a Conversation entity to async_openai's CreateChatCompletionRequest
 */
pub fn conversation_to_chat_request(conversation: Conversation) -> Result<CreateChatCompletionRequest, String> {
    Err("Not implemented yet".to_owned())
}
