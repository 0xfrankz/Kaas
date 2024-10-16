use async_openai::config::Config;
use reqwest::header::{HeaderMap, CONTENT_TYPE};
use secrecy::{ExposeSecret, Secret};
use serde::Deserialize;

/// Default values for Claude
pub const CLAUDE_ENV_KEY: &str = "CLAUDE_API_KEY";
pub const DEFAULT_CLAUDE_API_BASE: &str = "https://api.anthropic.com/v1";
pub const DEFAULT_CLAUDE_API_VERSION: &str = "2023-06-01";
pub const CLAUDE_API_KEY_HEADER: &str = "x-api-key";
pub const CLAUDE_API_VERSION_HEADER: &str = "anthropic-version";

/// Configuration for Anthropic Claude API
#[derive(Clone, Debug, Deserialize)]
#[serde(default)]
pub struct ClaudeConfig {
    api_base: String,
    api_key: Secret<String>,
    api_version: String,
}

impl Default for ClaudeConfig {
    fn default() -> Self {
        Self {
            api_base: DEFAULT_CLAUDE_API_BASE.to_string(),
            api_key: std::env::var(CLAUDE_ENV_KEY)
                .unwrap_or_else(|_| "".to_string())
                .into(),
            api_version: DEFAULT_CLAUDE_API_VERSION.to_string(),
        }
    }
}

impl ClaudeConfig {
    /// Create new config with default [DEFAULT_CLAUDE_API_BASE] url and default
    pub fn new() -> Self {
        Default::default()
    }

    /// To use an API base url different from default [DEFAULT_CLAUDE_API_BASE]
    pub fn with_api_base<S: Into<String>>(mut self, api_base: S) -> Self {
        self.api_base = api_base.into();
        self
    }

    /// To use an API key different from default environment variable
    pub fn with_api_key<S: Into<String>>(mut self, api_key: S) -> Self {
        self.api_key = Secret::from(api_key.into());
        self
    }

    /// To use an API version different from default [DEFAULT_CLAUDE_API_VERSION]
    pub fn with_api_version<S: Into<String>>(mut self, api_version: S) -> Self {
        self.api_version = api_version.into();
        self
    }
}

impl Config for ClaudeConfig {
    fn headers(&self) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(
            CLAUDE_API_KEY_HEADER,
            self.api_key.expose_secret().as_str().parse().unwrap(),
        );
        headers.insert(CLAUDE_API_VERSION_HEADER, self.api_version.parse().unwrap());
        headers.insert(CONTENT_TYPE, "application/json".parse().unwrap());

        headers
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
