use async_openai::{
    config::{AzureConfig, Config, OpenAIConfig},
    Client,
};
use entity::entities::{
    conversations::GenericOptions,
    messages::MessageDTO,
    models::{GenericConfig, Providers},
    settings::ProxySetting,
};
use reqwest;

use super::{
    chat::{BotReply, BotReplyStream, ChatRequestExecutor, GlobalSettings}, models::{ListModelsRequestExecutor, RemoteModel}, providers::{
        claude::config::ClaudeConfig, deepseek::config::DeepseekConfig, google::config::GoogleConfig, ollama::config::OllamaConfig, openrouter::config::DEFAULT_OPENROUTER_API_BASE, xai::config::XaiConfig
    }, types::{RawAzureConfig, RawClaudeConfig, RawDeepseekConfig, RawGoogleConfig, RawOllamaConfig, RawOpenAIConfig, RawXaiConfig}, utils::build_http_client
};

/// Wrapper of async-openai's Client struct
#[derive(Debug, Clone)]
pub enum LLMClient {
    OpenAIClient(Client<OpenAIConfig>, Option<String>),
    AzureClient(Client<AzureConfig>, Option<String>),
    ClaudeClient(Client<ClaudeConfig>, Option<String>),
    OllamaClient(Client<OllamaConfig>, Option<String>),
    OpenrouterClient(Client<OpenAIConfig>, Option<String>),
    DeepseekClient(Client<DeepseekConfig>, Option<String>),
    XaiClient(Client<XaiConfig>, Option<String>),
    GoogleClient(Client<GoogleConfig>, Option<String>),
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
                Ok(LLMClient::AzureClient(client, Some(String::default()))) // Azure doesn't require model, so use a blank string here
            }
            Providers::OpenAI | Providers::CUSTOM => {
                let raw_config: RawOpenAIConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let model = raw_config.model.clone();
                let client = Client::with_config(raw_config.into()).with_http_client(http_client);
                Ok(LLMClient::OpenAIClient(client, model))
            }
            Providers::Claude => {
                let raw_config: RawClaudeConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let model = raw_config.model.clone();
                let client = Client::with_config(raw_config.into()).with_http_client(http_client);
                Ok(LLMClient::ClaudeClient(client, model))
            }
            Providers::Ollama => {
                let raw_config: RawOllamaConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let model = raw_config.model.clone();
                let client = Client::with_config(raw_config.into()).with_http_client(http_client);
                Ok(LLMClient::OllamaClient(client, model))
            }
            Providers::Openrouter => {
                let raw_config: RawOpenAIConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let model = raw_config.model.clone();
                let config = Into::<OpenAIConfig>::into(raw_config)
                    .with_api_base(DEFAULT_OPENROUTER_API_BASE);
                let client = Client::with_config(config).with_http_client(http_client);
                Ok(LLMClient::OpenrouterClient(client, model))
            }
            Providers::Deepseek => {
                let raw_config: RawDeepseekConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let model = raw_config.model.clone();
                let client = Client::with_config(raw_config.into()).with_http_client(http_client);
                Ok(LLMClient::DeepseekClient(client, model))
            }
            Providers::Xai => {
                let raw_config: RawXaiConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let model = raw_config.model.clone();
                let client = Client::with_config(raw_config.into()).with_http_client(http_client);
                Ok(LLMClient::XaiClient(client, model))
            }
            Providers::Google => {
                let raw_config: RawGoogleConfig = serde_json::from_str(&config.config)
                    .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
                let model = raw_config.model.clone();
                let client = Client::with_config(raw_config.into()).with_http_client(http_client);
                Ok(LLMClient::GoogleClient(client, model))
            }
            _ => Err(format!(
                "{} is not supported yet",
                config.provider.as_str()
            )),
        }
    }

    async fn execute_chat_request<'c, F, C>(
        client: &'c Client<C>, // Replace ClientType with the actual type
        messages: Vec<MessageDTO>,
        options: GenericOptions,
        global_settings: GlobalSettings,
        model: &'c Option<String>,
        executor: F,
    ) -> Result<BotReply, String>
    where
        F: FnOnce(&'c Client<C>, Vec<MessageDTO>, GenericOptions, GlobalSettings, String) -> Result<ChatRequestExecutor<'c>, String>,
        C: Config,
    {
        match model {
            Some(model_str) => {
                let reply = executor(client, messages, options, global_settings, model_str.to_string())?
                    .execute()
                    .await?;
                Ok(reply)
            }
            None => Err(format!("Model not set for chat")),
        }
    }

    async fn execute_chat_request_stream<'c, F, C>(
        client: &'c Client<C>, // Replace ClientType with the actual type
        messages: Vec<MessageDTO>,
        options: GenericOptions,
        global_settings: GlobalSettings,
        model: &'c Option<String>,
        executor: F,
    ) -> Result<BotReplyStream, String>
    where
        F: FnOnce(&'c Client<C>, Vec<MessageDTO>, GenericOptions, GlobalSettings, String) -> Result<ChatRequestExecutor<'c>, String>,
        C: Config,
    {
        match model {
            Some(model_str) => {
                let stream = executor(client, messages, options, global_settings, model_str.to_string())?
                    .execute_stream()
                    .await?;
                Ok(stream)
            }
            None => Err(format!("Model not set for chat")),
        }
    }

    pub async fn chat(
        &self,
        messages: Vec<MessageDTO>,
        options: GenericOptions,
        global_settings: GlobalSettings,
    ) -> Result<BotReply, String> {
        match self {
            LLMClient::OpenAIClient(client, model) => {
                Self::execute_chat_request(client, messages, options, global_settings, model, ChatRequestExecutor::openai).await
            },
            LLMClient::AzureClient(client, model) => {
                Self::execute_chat_request(client, messages, options, global_settings, model, ChatRequestExecutor::azure).await
            }
            LLMClient::ClaudeClient(client, model) => {
                Self::execute_chat_request(client, messages, options, global_settings, model, ChatRequestExecutor::claude).await
            },
            LLMClient::OllamaClient(client, model) => {
                Self::execute_chat_request(client, messages, options, global_settings, model, ChatRequestExecutor::ollama).await
            },
            LLMClient::OpenrouterClient(client, model) => {
                Self::execute_chat_request(client, messages, options, global_settings, model, ChatRequestExecutor::openrouter).await
            },
            LLMClient::DeepseekClient(client, model) => {
                Self::execute_chat_request(client, messages, options, global_settings, model, ChatRequestExecutor::deepseek).await
            },
            LLMClient::XaiClient(client, model) => {
                Self::execute_chat_request(client, messages, options, global_settings, model, ChatRequestExecutor::xai).await
            },
            LLMClient::GoogleClient(client, model) => {
                Self::execute_chat_request(client, messages, options, global_settings, model, ChatRequestExecutor::google).await
            },
        }
    }

    pub async fn chat_stream(
        &self,
        messages: Vec<MessageDTO>,
        options: GenericOptions,
        global_settings: GlobalSettings,
    ) -> Result<BotReplyStream, String> {
        match self {
            LLMClient::OpenAIClient(client, model) => {
                Self::execute_chat_request_stream(client, messages, options, global_settings, model, ChatRequestExecutor::openai).await
            },
            LLMClient::AzureClient(client, model) => {
                Self::execute_chat_request_stream(client, messages, options, global_settings, model, ChatRequestExecutor::azure).await
            }
            LLMClient::ClaudeClient(client, model) => {
                Self::execute_chat_request_stream(client, messages, options, global_settings, model, ChatRequestExecutor::claude).await
            },
            LLMClient::OllamaClient(client, model) => {
                Self::execute_chat_request_stream(client, messages, options, global_settings, model, ChatRequestExecutor::ollama).await
            },
            LLMClient::OpenrouterClient(client, model) => {
                Self::execute_chat_request_stream(client, messages, options, global_settings, model, ChatRequestExecutor::openrouter).await
            },
            LLMClient::DeepseekClient(client, model) => {
                Self::execute_chat_request_stream(client, messages, options, global_settings, model, ChatRequestExecutor::deepseek).await
            },
            LLMClient::XaiClient(client, model) => {
                Self::execute_chat_request_stream(client, messages, options, global_settings, model, ChatRequestExecutor::xai).await
            },
            LLMClient::GoogleClient(client, model) => {
                Self::execute_chat_request_stream(client, messages, options, global_settings, model, ChatRequestExecutor::google).await
            },
        }
    }

    pub async fn models(&self) -> Result<Vec<RemoteModel>, String> {
        match self {
            LLMClient::OpenAIClient(client, _) => {
                let result = ListModelsRequestExecutor::openai(client).execute().await?;
                Ok(result)
            }
            LLMClient::AzureClient(_, _) => {
                // Azure doesn't support model list
                Err("List models API is not supported by Azure".to_string())
            }
            LLMClient::ClaudeClient(client, _) => {
                let result = ListModelsRequestExecutor::claude(client).execute().await?;
                Ok(result)
            }
            LLMClient::OllamaClient(client, _) => {
                let result = ListModelsRequestExecutor::ollama(client).execute().await?;
                Ok(result)
            }
            LLMClient::OpenrouterClient(client, _) => {
                let result = ListModelsRequestExecutor::openrouter(client).execute().await?;
                Ok(result)
            }
            LLMClient::DeepseekClient(client, _) => {
                let result = ListModelsRequestExecutor::deepseek(client).execute().await?;
                Ok(result)
            }
            LLMClient::XaiClient(client, _) => {
                let result = ListModelsRequestExecutor::xai(client).execute().await?;
                Ok(result)
            }
            LLMClient::GoogleClient(client, _) => {
                let result = ListModelsRequestExecutor::google(client).execute().await?;
                Ok(result)
            }
        }
    }
}
