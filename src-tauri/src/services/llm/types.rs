use async_openai::config::{AzureConfig, OpenAIConfig};
use serde::Deserialize;

use super::providers::{
        claude::config::ClaudeConfig, deepseek::config::DeepseekConfig, ollama::config::OllamaConfig, xai::config::XaiConfig
    };

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawAzureConfig {
    pub api_key: String,
    pub endpoint: String,
    pub api_version: String,
    pub deployment_id: String,
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
pub struct RawOpenAIConfig {
    pub api_key: String,
    pub model: Option<String>,
    pub endpoint: Option<String>,
    pub org_id: Option<String>,
}

impl Into<OpenAIConfig> for RawOpenAIConfig {
    fn into(self) -> OpenAIConfig {
        let mut config = OpenAIConfig::new().with_api_key(self.api_key);
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
pub struct RawClaudeConfig {
    pub api_key: String,
    pub model: String,
    pub api_version: String,
    pub endpoint: Option<String>,
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
pub struct RawOllamaConfig {
    pub endpoint: String,
    pub model: Option<String>,
}

impl Into<OllamaConfig> for RawOllamaConfig {
    fn into(self) -> OllamaConfig {
        OllamaConfig::new().with_api_base(self.endpoint)
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawDeepseekConfig {
    pub api_key: String,
    pub model: Option<String>,
    pub endpoint: Option<String>,
}

impl Into<DeepseekConfig> for RawDeepseekConfig {
    fn into(self) -> DeepseekConfig {
        let mut config = DeepseekConfig::new()
            .with_api_key(self.api_key);
        if let Some(endpoint) = self.endpoint {
            config = config.with_api_base(endpoint);
        }

        config
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RawXaiConfig {
    pub api_key: String,
    pub model: Option<String>,
    pub endpoint: Option<String>,
}

impl Into<XaiConfig> for RawXaiConfig {
    fn into(self) -> XaiConfig {
        let mut config = XaiConfig::new()
            .with_api_key(self.api_key);
        if let Some(endpoint) = self.endpoint {
            config = config.with_api_base(endpoint);
        }

        config
    }
}
