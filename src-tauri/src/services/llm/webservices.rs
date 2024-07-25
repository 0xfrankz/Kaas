use async_openai::{
    config::{AzureConfig, Config, OpenAIConfig}, error::OpenAIError, types::{
        ChatCompletionRequestMessage, ChatCompletionResponseStream, CreateChatCompletionRequest
    }, Client
};
use entity::entities::{conversations::{AzureOptions, ClaudeOptions, OpenAIOptions, ProviderOptions}, messages::MessageDTO, models::{ProviderConfig, Providers}, settings::ProxySetting};
use reqwest;
use serde::{Serialize, Deserialize};
use crate::services::llm::utils::message_to_openai_request_message;

use super::{config::ClaudeConfig, utils::{build_http_client, message_to_claude_request_message}};

use super::utils::messages_and_options_to_request;

const DEFAULT_CHAT_PATH: &str = "/chat/completions";
const CLAUDE_CHAT_PATH: &str = "/messages";

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

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeMessageContentPartText {
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeImageSource {
    pub r#type: String,
    pub media_type: String,
    pub data: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeMessageContentPartImage {
    pub source: ClaudeImageSource,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(tag = "type")]
#[serde(rename_all = "lowercase")]
pub enum ClaudeMessageContentPart {
    Text(ClaudeMessageContentPartText),
    Image(ClaudeMessageContentPartImage),
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeResponseMessageText {
    text: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct  ClaudeResponseMessageTool {
    pub id: String,
    pub name: String,
    pub input: serde_json::Value
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(untagged)]
pub enum ClaudeRequestMessageContent {
    /// Single text content of the message
    Text(String),
    /// An array of content parts with a defined type, each can be of type `text` or `image`
    Array(Vec<ClaudeMessageContentPart>),
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(tag = "type")]
#[serde(rename_all = "snake_case")]
pub enum ClaudeResponseMessageContent {
    /// Single text content of the message
    Text(ClaudeResponseMessageText),
    /// A tool that is to be used by the model
    ToolUse(ClaudeResponseMessageTool),
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeUserMessage {
    pub content: ClaudeRequestMessageContent,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeAssistantMessage {
    pub content: ClaudeRequestMessageContent,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(tag = "role")]
#[serde(rename_all = "lowercase")]
pub enum ClaudeMessage {
    User(ClaudeUserMessage),
    Assistant(ClaudeAssistantMessage),
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeMetadata {
    pub user_id: String,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeNamedTool {
    name: String
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[serde(rename_all = "lowercase")]
pub enum ClaudeToolChoices {
    Auto,
    Any,
    Tool(ClaudeNamedTool)
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeTool {
    name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    input_schema: serde_json::Value
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeUsage {
    input_tokens: u32,
    output_tokens: u32,
}

#[derive(Clone, Serialize, Default, Debug, Deserialize, PartialEq)]
pub struct ClaudeChatCompletionRequest {
    /// ID of the model to use.
    /// Required.
    /// See the [Models](https://docs.anthropic.com/en/docs/about-claude/models) page for a list of available models.
    pub model: String,

    /// A list of messages comprising the conversation so far.
    /// Required.
    pub messages: Vec<ClaudeMessage>,

    /// The maximum number of tokens to generate before stopping.
    /// Required.
    pub max_tokens: u32,

    /// An object describing metadata about the request.
    /// metadata.user_id: An external identifier for the user who is associated with the request.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<ClaudeMetadata>,

    /// Custom text sequences that will cause the model to stop generating.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop_sequences: Option<Vec<String>>,

    /// Whether to incrementally stream the response using server-sent events.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,

    /// System prompt.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<String>,

    /// Amount of randomness injected into the response.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>, // min: 0, max: 1

    /// How the model should use the provided tools. The model can use a specific tool, any available tool, or decide by itself.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_choice: Option<ClaudeToolChoices>,

    /// Definitions of tools that the model may use.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tools: Option<Vec<ClaudeTool>>,

    /// Only sample from the top K options for each subsequent token.
    /// Recommended for advanced use cases only. You usually only need to use temperature.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_k: Option<u32>,

    /// Use nucleus sampling.
    /// Recommended for advanced use cases only. You usually only need to use temperature.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeChatCompletionResponse {
    /// Unique object identifier.
    pub id: String,

    /// Object type.
    /// For Messages, this is always "message".
    pub r#type: String,

    /// Conversational role of the generated message.
    /// This will always be "assistant".
    pub role: String,

    /// Content generated by the model.
    pub content: Vec<ClaudeResponseMessageContent>,

    /// The model that handled the request.
    pub model: String,

    /// The reason that we stopped.
    pub stop_reason: Option<String>,

    /// Which custom stop sequence was generated, if any.
    pub stop_sequence: Option<String>,

    /// Billing and rate-limit usage.
    pub usage: ClaudeUsage,
}

/// Given a list of messages comprising a conversation, the model will return a response.
struct ClaudeChat<'c> {
    client: &'c Client<ClaudeConfig>,
}

impl<'c> ClaudeChat<'c> {
    pub fn new(client: &'c Client<ClaudeConfig>) -> Self {
        Self { client }
    }

    pub async fn create(
        &self,
        request: ClaudeChatCompletionRequest
    ) -> Result<ClaudeChatCompletionResponse, OpenAIError> {
        if request.stream.is_some() && request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is true, use ClaudeChat::create_stream".into(),
            ));
        }
        self.client.post(CLAUDE_CHAT_PATH, request).await
    }
}

pub trait LLMClientTrait: Sized {
    fn new(config: ProviderConfig, proxy_setting: Option<ProxySetting>) -> Result<Self, String>;
    async fn chat(&self, messages: Vec<MessageDTO>, options: ProviderOptions, global_settings: GlobalSettings) -> Result<BotReply, String>;
}

/// Wrapper of async-openai's Client struct
#[derive(Debug, Clone)]
pub enum LLMClient {
    OpenAIClient(Client<OpenAIConfig>, String),
    AzureClient(Client<AzureConfig>),
    ClaudeClient(Client<ClaudeConfig>, String),
}

impl LLMClientTrait for LLMClient {
    /// Build client from config
    fn new(config: ProviderConfig, proxy_setting: Option<ProxySetting>) -> Result<Self, String> {
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

    async fn chat(&self, messages: Vec<MessageDTO>, options: ProviderOptions, global_settings: GlobalSettings) -> Result<BotReply, String> {
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
}
