use async_openai::config::Config;
use reqwest::header::HeaderMap;
use secrecy::Secret;
use serde::Deserialize;

pub const DEFAULT_OLLAMA_API_BASE: &str = "http://localhost:11434";

/// Configuration for Ollama API
#[derive(Clone, Debug, Deserialize)]
#[serde(default)]
pub struct OllamaConfig {
    api_base: String,
    // Ollama doesn't require API key
    // but we need an empty secret here to satisfy async-openai
    api_key: Secret<String>,
}

impl Default for OllamaConfig {
    fn default() -> Self {
        Self {
            api_base: DEFAULT_OLLAMA_API_BASE.to_string(),
            api_key: "".to_string().into(),
        }
    }
}

impl OllamaConfig {
    /// Create new config with default [DEFAULT_OLLAMA_API_BASE] url and default
    pub fn new() -> Self {
        Default::default()
    }

    /// To use an API base url different from default [DEFAULT_OLLAMA_API_BASE]
    pub fn with_api_base<S: Into<String>>(mut self, api_base: S) -> Self {
        self.api_base = api_base.into();
        self
    }
}

impl Config for OllamaConfig {
    fn headers(&self) -> HeaderMap {
        // Ollama doesn't require any particular headers
        HeaderMap::new()
    }

    fn url(&self, path: &str) -> String {
        format!("{}{}", self.api_base, path)
    }

    fn query(&self) -> Vec<(&str, &str)> {
        vec![]
    }

    fn api_base(&self) -> &str {
        &self.api_base
    }

    fn api_key(&self) -> &Secret<String> {
        &self.api_key
    }
}
