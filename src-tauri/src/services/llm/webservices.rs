use async_openai::{
    config::{AzureConfig, Config, OpenAIConfig}, types::{
        ChatCompletionRequestMessage, ChatCompletionResponseStream, CreateChatCompletionRequest
    },
    Client
};
use entity::entities::{conversations::{AzureOptions, ClaudeOptions, OpenAIOptions, ProviderOptions}, messages::MessageDTO, models::{ProviderConfig, Providers}, settings::ProxySetting};
use reqwest;
use serde::{Serialize, Deserialize};
use crate::services::llm::utils::message_to_openai_request_message;

use super::{chat::{ClaudeChat, ClaudeChatCompletionRequest, ClaudeMessage, ClaudeMetadata, ClaudeResponseMessageContent}, config::ClaudeConfig, utils::{build_http_client, message_to_claude_request_message}};

use super::utils::messages_and_options_to_request;

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

        config
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawClaudeConfig {
    api_key: String,
    model: String,
    api_version: String,
    api_base: Option<String>,
}

impl Into<ClaudeConfig> for RawClaudeConfig {
    fn into(self) -> ClaudeConfig {
        let mut config = ClaudeConfig::new()
            .with_api_key(self.api_key)
            .with_api_version(self.api_version);
        if let Some(api_base) = self.api_base {
            config = config.with_api_base(api_base);
        }

        config
    }
}

#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub struct BotReply {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub prompt_token: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub completion_token: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub total_token: Option<u32>,
}

pub async fn complete_chat_stream(messages: Vec<MessageDTO>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, default_max_tokens: Option<u32>) -> Result<ChatCompletionResponseStream, String> {
    match config.provider.as_str().into() {
        Providers::Azure => {
            let (client, request) = build_azure_client_and_request(messages, options, config, proxy_setting, default_max_tokens)?;
            let stream = client.chat().create_stream(request).await.map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
            return Ok(stream);
        },
        Providers::OpenAI => {
            let (client, request) = build_openai_client_and_request(messages, options, config, proxy_setting, default_max_tokens)?;
            let stream = client.chat().create_stream(request).await.map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
            return Ok(stream);
        },
        _ => {
            return Err(format!("Complete chat with {} not supported yet", config.provider.as_str()));
        }
    }
}

pub async fn list_models(provider: String, api_key: String, proxy_setting: Option<ProxySetting>) -> Result<Vec<async_openai::types::Model>, String> {
    let http_client: reqwest::Client = build_http_client(proxy_setting);
    match provider.as_str().into() {
        Providers::Azure => {
            let config = AzureConfig::default().with_api_key(api_key);
            let client = Client::with_config(config).with_http_client(http_client);
            list_models_with_client(client).await
        },
        Providers::OpenAI => {
            let config = OpenAIConfig::default().with_api_key(api_key);
            let client = Client::with_config(config).with_http_client(http_client);
            list_models_with_client(client).await
        },
        _ => {
            Err(format!("List models with {} not supported yet", provider))
        }
    }
}

async fn list_models_with_client<C: Config>(client: Client<C>) -> Result<Vec<async_openai::types::Model>, String> {
    let result = client
        .models()
        .list()
        .await
        .map_err(|err| {
            log::error!("list_models: {}", err);
            String::from("Failed to list models")
        })?
        .data;
    Ok(result)
}

fn build_azure_client_and_request(messages: Vec<MessageDTO>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, default_max_tokens: Option<u32>) -> Result<(Client<AzureConfig>, CreateChatCompletionRequest), String> {
    let http_client = build_http_client(proxy_setting);
    let config_json: RawAzureConfig = serde_json::from_str(&config.config)
        .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
    let config: AzureConfig = config_json.into();
    let client = Client::with_config(config).with_http_client(http_client);
    let request = messages_and_options_to_request(messages, &options, default_max_tokens)?;
    Ok((client, request))
}

fn build_openai_client_and_request(messages: Vec<MessageDTO>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, default_max_tokens: Option<u32>) -> Result<(Client<OpenAIConfig>, CreateChatCompletionRequest), String> {
    let http_client = build_http_client(proxy_setting);
    let config_json: RawOpenAIConfig = serde_json::from_str(&config.config)
        .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
    let model = config_json.model.clone();
    let config: OpenAIConfig = config_json.into();
    let client = Client::with_config(config).with_http_client(http_client);
    let mut request = messages_and_options_to_request(messages, &options, default_max_tokens)?;
    request.model = model;
    Ok((client, request))
}

pub struct GlobalSettings {
    pub max_tokens: u32,
}

/// Wrapper of async-openai's Client struct
#[derive(Debug, Clone)]
pub enum LLMClient {
    OpenAIClient(Client<OpenAIConfig>, String),
    AzureClient(Client<AzureConfig>),
    ClaudeClient(Client<ClaudeConfig>, String),
}

impl LLMClient {
    /// Build client from config
    pub fn new(config: ProviderConfig, proxy_setting: Option<ProxySetting>) -> Result<Self, String> {
        let http_client: reqwest::Client = build_http_client(proxy_setting);
        match config.provider.as_str().into() {
            Providers::Azure => {
                let raw_config: RawAzureConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let client = Client::with_config(raw_config.into()).with_http_client(http_client);
                Ok(LLMClient::AzureClient(client))
            },
            Providers::OpenAI => {
                let raw_config: RawOpenAIConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let model = raw_config.model.clone();
                let client = Client::with_config(raw_config.into()).with_http_client(http_client);
                Ok(LLMClient::OpenAIClient(client, model))
            },
            Providers::Claude => {
                let raw_config: RawClaudeConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let model = raw_config.model.clone();
                let client = Client::with_config(raw_config.into()).with_http_client(http_client);
                Ok(LLMClient::ClaudeClient(client, model))
            },
            _ => {
                Err(format!("Complete chat with {} not supported yet", config.provider.as_str()))
            }
        }
    }

    pub async fn chat(&self, messages: Vec<MessageDTO>, options: ProviderOptions, global_settings: GlobalSettings) -> Result<BotReply, String> {
        match self {
            LLMClient::OpenAIClient(client, model) => {
                let request: CreateChatCompletionRequest;
                // set messages
                let req_messages: Vec<ChatCompletionRequestMessage> = messages.into_iter().map(message_to_openai_request_message).collect();
                // set options
                let options: OpenAIOptions = serde_json::from_str(&options.options)
                    .map_err(|_| format!("Failed to parse conversation options: {}", &options.options))?;
                // build request
                request = CreateChatCompletionRequest {
                    model: model.to_string(),
                    messages: req_messages,
                    frequency_penalty: options.frequency_penalty,
                    max_tokens: options.max_tokens.or(Some(global_settings.max_tokens)),
                    n: options.n,
                    presence_penalty: options.presence_penalty,
                    stream: options.stream,
                    temperature: options.temperature,
                    top_p: options.top_p,
                    user: options.user,
                    ..Default::default()
                };
                // execute request
                let response = client
                    .chat()
                    .create(request)
                    .await
                    .map_err(|err| {
                        log::error!("execute_chat_complete_request: {:?}", err);
                        format!("Failed to get chat completion response: {}", err)
                    })?;
                // extract data & build reply
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
                let usage = response.usage;
                let reply = BotReply {
                    message,
                    prompt_token: usage.as_ref().map(|usage| usage.prompt_tokens),
                    completion_token: usage.as_ref().map(|usage| usage.completion_tokens),
                    total_token: usage.as_ref().map(|usage| usage.total_tokens),
                };
            
                return Ok(reply)
            },
            LLMClient::AzureClient(client) => {
                let request: CreateChatCompletionRequest;
                // set messages
                let req_messages: Vec<ChatCompletionRequestMessage> = messages.into_iter().map(message_to_openai_request_message).collect();
                // set options
                let options: AzureOptions = serde_json::from_str(&options.options)
                    .map_err(|_| format!("Failed to parse conversation options: {}", &options.options))?;
                // build request
                request = CreateChatCompletionRequest {
                    messages: req_messages,
                    frequency_penalty: options.frequency_penalty,
                    max_tokens: options.max_tokens.or(Some(global_settings.max_tokens)),
                    n: options.n,
                    presence_penalty: options.presence_penalty,
                    stream: options.stream,
                    temperature: options.temperature,
                    top_p: options.top_p,
                    user: options.user,
                    ..Default::default()
                };
                // execute request
                let response = client
                    .chat()
                    .create(request)
                    .await
                    .map_err(|err| {
                        log::error!("execute_chat_complete_request: {:?}", err);
                        format!("Failed to get chat completion response: {}", err)
                    })?;
                // extract data & build reply
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
                let usage = response.usage;
                let reply = BotReply {
                    message,
                    prompt_token: usage.as_ref().map(|usage| usage.prompt_tokens),
                    completion_token: usage.as_ref().map(|usage| usage.completion_tokens),
                    total_token: usage.as_ref().map(|usage| usage.total_tokens),
                };
            
                return Ok(reply)
            },
            LLMClient::ClaudeClient(client, model) => {
                let request: ClaudeChatCompletionRequest;
                // set messages
                let req_messages: Vec<ClaudeMessage> = messages.into_iter().map(message_to_claude_request_message).collect();
                // set options
                let options: ClaudeOptions = serde_json::from_str(&options.options)
                    .map_err(|_| format!("Failed to parse conversation options: {}", &options.options))?;
                // build request
                request = ClaudeChatCompletionRequest {
                    model: model.to_string(),
                    messages: req_messages,
                    max_tokens: options.max_tokens.unwrap_or(global_settings.max_tokens),
                    stream: options.stream,
                    temperature: options.temperature,
                    top_p: options.top_p,
                    metadata: options.user.map(|user| {
                        ClaudeMetadata {
                            user_id: user,
                        }
                    }),
                    ..Default::default()
                };
                // execute request
                let response = ClaudeChat::new(client)
                    .create(request)
                    .await
                    .map_err(|err| {
                        log::error!("execute_chat_complete_request: {:?}", err);
                        format!("Failed to get chat completion response: {}", err)
                    })?;
                // extract data & build reply
                let content = response
                    .content
                    .first()
                    .ok_or("Api returned empty content".to_string())?;
                let message = match content {
                    ClaudeResponseMessageContent::Text(text) => {
                        text.text.clone()
                    },
                    ClaudeResponseMessageContent::ToolUse(_) => "ToolUse is not implemented yet".to_string()
                };
                let usage = response.usage;
                let reply = BotReply {
                    message,
                    prompt_token: Some(usage.input_tokens),
                    completion_token: Some(usage.output_tokens),
                    total_token: Some(usage.input_tokens + usage.output_tokens),
                };
                
                return Ok(reply)
            },
        }
    }

    pub async fn chat_stream(&self, messages: Vec<MessageDTO>, options: ProviderOptions, global_settings: GlobalSettings) -> Result<ChatCompletionResponseStream, String> {
        // match self {
        //     LLMClient::OpenAIClient(client, model) => {
        //     }
        // }
        todo!();
    }
}
