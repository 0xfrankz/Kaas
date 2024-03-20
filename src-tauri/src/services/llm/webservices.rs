use std::collections::HashMap;

use async_openai::{
    config::{AzureConfig, Config}, types::{
        ChatCompletionRequestUserMessageArgs, ChatCompletionResponseFormat, CreateChatCompletionRequestArgs, Stop
    }, Client
};
use entity::entities::{messages::Model as Message, models::Providers};
use entity::entities::models::Model;
use serde::Deserialize;

use crate::services::llm::utils::{model_to_azure_client, model_to_openai_client};

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
#[allow(dead_code)]
struct RawOption {
    pub frequency_penalty: Option<f32>, // min: -2.0, max: 2.0, default: 0
    pub logit_bias: Option<HashMap<String, serde_json::Value>>, // default: null
    pub logprobs: Option<bool>,
    pub top_logprobs: Option<u8>,
    pub max_tokens: Option<u16>,
    pub n: Option<u8>, // min:1, max: 128, default: 1
    pub presence_penalty: Option<f32>, // min: -2.0, max: 2.0, default 0
    pub response_format: Option<ChatCompletionResponseFormat>,
    pub seed: Option<i64>,
    pub stop: Option<Stop>,
    pub stream: Option<bool>,
    pub temperature: Option<f32>, // min: 0, max: 2, default: 1,
    pub top_p: Option<f32>, // min: 0, max: 1, default: 1
    // pub tools: Option<Vec<ChatCompletionTool>>,
    // pub tool_choice: Option<ChatCompletionToolChoiceOption>,
    pub user: Option<String>,
    // pub function_call: Option<ChatCompletionFunctionCall>,
    // pub functions: Option<Vec<ChatCompletionFunctions>>,
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

async fn complete_chat_with_client<C: Config>(message: Message, client: Client<C>) -> Result<String, String> {
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