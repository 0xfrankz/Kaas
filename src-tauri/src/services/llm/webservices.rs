use async_openai::{
    config::{AzureConfig, Config}, types::{
        ChatCompletionRequestUserMessageArgs, CreateChatCompletionRequestArgs
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

pub async fn _complete_chat() -> Result<String, String> {
    let config = AzureConfig::new()
        .with_api_base("<base_url>")
        .with_api_version("<api_version, required, check playground's demo code>")
        .with_deployment_id("<deployment_name>")
        .with_api_key("<api_key>");

    let client = Client::with_config(config);

    let request = CreateChatCompletionRequestArgs::default()
        .max_tokens(200_u16)
        .messages([
            ChatCompletionRequestUserMessageArgs::default()
                .content("what's your name?")
                .build()
                .map_err(|_| String::from("Failed to build Azure chat completion user message"))?
                .into()
        ])
        .build()
        .map_err(|_| String::from("Failed to build Azure chat completion request"))?;

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

pub async fn complete_chat(message: Message, model: Model) -> Result<String, String> {
    match model.provider.as_str().into() {
        Providers::Azure => {
            let client = model_to_azure_client(&model)?;
            return complete_chat_with_client(message, client).await;
        },
        _ => {
            Err("Complete chat with OpenAI not implemented yet".to_owned())
        }
    }
}

pub async fn complete_chat_with_options_and_config(message: Message, options: ProviderOptions, config: ProviderConfig) -> Result<String, String> {
    let client;
    let request;
    match config.provider.as_str().into() {
        Providers::Azure => {
            client = config_to_azure_client(&config)?;
            // return complete_chat_with_client(message, client).await;
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

async fn complete_chat_with_client<C: Config>(message: Message, client: Client<C>) -> Result<String, String> {
    // Using default options
    // TODO: set options of request
    let request = CreateChatCompletionRequestArgs::default()
        .max_tokens(200_u16)
        .messages([
            ChatCompletionRequestUserMessageArgs::default()
                .content(message.content.clone())
                .build()
                .map_err(|_| String::from("Failed to build Azure chat completion user message"))?
                .into()
        ])
        .build()
        .map_err(|_| String::from("Failed to build Azure chat completion request"))?;

    log::info!("Calling API with: message = {:?}, request = {:?}", message, request);
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