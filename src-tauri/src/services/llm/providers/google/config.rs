use async_openai::config::Config;
use reqwest::header::HeaderMap;
use secrecy::{ExposeSecret, Secret};
use serde::Deserialize;

pub const DEFAULT_GOOGLE_API_BASE: &str = "https://generativelanguage.googleapis.com";
pub const DEFAULT_API_VERSION: &str = "v1beta";

#[derive(Clone, Debug, Deserialize)]
#[serde(default)]
pub struct GoogleConfig {
    pub api_base: String,
    pub api_key: Secret<String>,
    pub api_version: String,
    pub model: Option<String>,
    pub alt: Option<String>,
}

impl Default for GoogleConfig {
    fn default() -> Self {
        Self {
            api_base: DEFAULT_GOOGLE_API_BASE.to_string(),
            api_key: "".to_string().into(),
            api_version: DEFAULT_API_VERSION.to_string(),
            model: None,
            alt: None,
        }
    }
}

impl GoogleConfig {
    pub fn new() -> Self {
        Default::default()
    }

    pub fn with_api_base<S: Into<String>>(mut self, api_base: S) -> Self {
        self.api_base = api_base.into();
        self
    }

    pub fn with_api_key<S: Into<String>>(mut self, api_key: S) -> Self {
        self.api_key = Secret::from(api_key.into());
        self
    }
    
    pub fn with_api_version<S: Into<String>>(mut self, api_version: S) -> Self {
        self.api_version = api_version.into();
        self
    }

    pub fn with_model<S: Into<String>>(mut self, model: S) -> Self {
        self.model = Some(model.into());
        self
    }

    pub fn with_alt<S: Into<String>>(mut self, alt: S) -> Self {
        self.alt = Some(alt.into());
        self
    }
}

impl Config for GoogleConfig {
    fn headers(&self) -> HeaderMap {
        HeaderMap::default()
    }

    fn url(&self, path: &str) -> String {
        format!("{}/{}{}", self.api_base, self.api_version, path)
    }

    fn query(&self) -> Vec<(&str, &str)> {
        let mut query = Vec::new();
        if let Some(alt) = &self.alt {
            query.push(("alt", alt.as_str()));
        }
        query.push(("key", self.api_key.expose_secret().as_str()));
        query
    }

    fn api_base(&self) -> &str {
        &self.api_base
    }
    
    fn api_key(&self) -> &secrecy::Secret<String> {
        &self.api_key
    }
}
