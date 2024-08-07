use async_openai::{
    config::{AzureConfig, OpenAIConfig},
    Client
};
use entity::entities::{conversations::GenericOptions, messages::MessageDTO, models::{GenericConfig, Providers}, settings::ProxySetting};
use reqwest;
use serde::Deserialize;

use super::{chat::{BotReply, BotReplyStream, ChatRequest, GlobalSettings}, config::{ClaudeConfig, OllamaConfig}, models::{ListModelsRequest, RemoteModel}, utils::build_http_client};

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

/// OpenAI config
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawOpenAIConfig {
    api_key: String,
    model: Option<String>,
    endpoint: Option<String>,
    org_id: Option<String>,
}

impl Into<OpenAIConfig> for RawOpenAIConfig {
    fn into(self) -> OpenAIConfig {
        let mut config = OpenAIConfig::new()
            .with_api_key(self.api_key);
        if let Some(endpoint) = self.endpoint {
            config = config.with_api_base(endpoint);
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
    endpoint: Option<String>,
}

impl Into<ClaudeConfig> for RawClaudeConfig {
    fn into(self) -> ClaudeConfig {
        let mut config = ClaudeConfig::new()
            .with_api_key(self.api_key)
            .with_api_version(self.api_version);
        if let Some(endpoint) = self.endpoint {
            config = config.with_api_base(endpoint);
        }

        config
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawOllamaConfig {
    endpoint: String,
    model: Option<String>,
}

impl Into<OllamaConfig> for RawOllamaConfig {
    fn into(self) -> OllamaConfig {
        OllamaConfig::new()
            .with_api_base(self.endpoint)
    }
}

/// Wrapper of async-openai's Client struct
#[derive(Debug, Clone)]
pub enum LLMClient {
    OpenAIClient(Client<OpenAIConfig>, Option<String>),
    AzureClient(Client<AzureConfig>),
    ClaudeClient(Client<ClaudeConfig>, String),
    OllamaClient(Client<OllamaConfig>, Option<String>),
}

impl LLMClient {
    /// Build client from config
    pub fn new(config: GenericConfig, proxy_setting: Option<ProxySetting>) -> Result<Self, String> {
        let http_client: reqwest::Client = build_http_client(proxy_setting);
        match config.provider.as_str().into() {
            Providers::Azure => {
                let raw_config: RawAzureConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let client = Client::with_config(raw_config.into()).with_http_client(http_client);
                Ok(LLMClient::AzureClient(client))
            },
            Providers::OpenAI | Providers::CUSTOM => {
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
            Providers::Ollama => {
                let raw_config: RawOllamaConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let model = raw_config.model.clone();
                let client = Client::with_config(raw_config.into());
                Ok(LLMClient::OllamaClient(client, model))
            },
            _ => {
                Err(format!("Complete chat with {} not supported yet", config.provider.as_str()))
            }
        }
    }

    pub async fn chat(&self, messages: Vec<MessageDTO>, options: GenericOptions, global_settings: GlobalSettings) -> Result<BotReply, String> {
        match self {
            LLMClient::OpenAIClient(client, model) => {
                match model.as_ref() {
                    Some(model_str) => {
                        let reply = ChatRequest::openai(client, messages, options, global_settings, model_str.to_string())?
                            .execute()
                            .await?;                
                        Ok(reply)
                    },
                    None => Err(format!("OpenAI model not set"))
                }
            },
            LLMClient::AzureClient(client) => {
                let reply = ChatRequest::azure(client, messages, options, global_settings)?
                    .execute()
                    .await?;                
                return Ok(reply)
            },
            LLMClient::ClaudeClient(client, model) => {
                let reply = ChatRequest::claude(client, messages, options, global_settings, model.to_string())?
                    .execute()
                    .await?;                
                return Ok(reply)
            },
            LLMClient::OllamaClient(client, model) => {
                match model.as_ref() {
                    Some(model_str) => {
                        let reply = ChatRequest::ollama(client, messages, options, global_settings, model_str.to_string())?
                            .execute()
                            .await?;                
                        Ok(reply)
                    },
                    None => Err(format!("Ollama model not set for chat"))
                }
            }
        }
    }

    pub async fn chat_stream(&self, messages: Vec<MessageDTO>, options: GenericOptions, global_settings: GlobalSettings) -> Result<BotReplyStream, String> {
        match self {
            LLMClient::OpenAIClient(client, model) => {
                match model.as_ref() {
                    Some(model_str) => {
                        let stream = ChatRequest::openai(client, messages, options, global_settings, model_str.to_string())?
                            .execute_stream()
                            .await?;                
                        Ok(stream)
                    },
                    None => Err(format!("OpenAI model not set for chat stream"))
                }
            },
            LLMClient::AzureClient(client) => {
                let stream = ChatRequest::azure(client, messages, options, global_settings)?
                    .execute_stream()
                    .await?;                
                return Ok(stream)
            },
            LLMClient::ClaudeClient(client, model) => {
                let stream = ChatRequest::claude(client, messages, options, global_settings, model.to_string())?
                    .execute_stream()
                    .await?;                
                return Ok(stream)
            },
            LLMClient::OllamaClient(client, model) => {
                match model.as_ref() {
                    Some(model_str) => {
                        let stream = ChatRequest::ollama(client, messages, options, global_settings, model_str.to_string())?
                            .execute_stream()
                            .await?;                
                        Ok(stream)
                    },
                    None => Err(format!("Ollama model not set for chat stream"))
                }
            }
        }
    }

    pub async fn models(&self) -> Result<Vec<RemoteModel>, String> {
        match self {
            LLMClient::OpenAIClient(client, _) => {
                let result = ListModelsRequest::openai(client)
                    .execute()
                    .await?;
                Ok(result)
            },
            LLMClient::AzureClient(_) => {
                // Azure doesn't support model list
                Err("List models API is not supported by Azure".to_string())
            },
            LLMClient::ClaudeClient(_, _) => {
                // Claude doesn't support model list
                Err("List models API is not supported by Azure".to_string())
            },
            LLMClient::OllamaClient(client, _) => {
                let result = ListModelsRequest::ollama(client)
                    .execute()
                    .await?;
                Ok(result)
            }
        }
    }
}
