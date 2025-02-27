use async_openai::config::Config;
use reqwest::header::{HeaderMap, AUTHORIZATION};
use secrecy::{ExposeSecret, Secret};
use serde::Deserialize;

pub const DEFAULT_XAI_API_BASE: &str = "https://api.x.ai";

#[derive(Clone, Debug, Deserialize)]
#[serde(default)]
pub struct XaiConfig {
    pub api_base: String,
    pub api_key: Secret<String>,
}

impl Default for XaiConfig {
    fn default() -> Self {
        Self {
            api_base: DEFAULT_XAI_API_BASE.to_string(),
            api_key: "".to_string().into(),
        }
    }
}

impl XaiConfig {
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
}

impl Config for XaiConfig {
    fn headers(&self) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(
            AUTHORIZATION, 
            format!("Bearer {}", self.api_key.expose_secret())
                .as_str()
                .parse()
                .unwrap()
        );
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
    
    fn api_key(&self) -> &secrecy::Secret<String> {
        &self.api_key
    }
}
