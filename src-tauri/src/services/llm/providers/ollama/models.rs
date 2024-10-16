use super::config::OllamaConfig;
use async_openai::{error::OpenAIError, Client};
use serde::{Deserialize, Serialize};

const OLLAMA_LIST_MODELS_PATH: &str = "/api/tags";

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct OllamaRemoteModelDetails {
    pub format: String,
    pub family: String,
    pub families: Option<Vec<String>>,
    pub parameter_size: String,
    pub quantization_level: String,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct OllamaRemoteModel {
    pub name: String,
    pub modified_at: String,
    pub size: u64,
    pub digest: String,
    pub details: OllamaRemoteModelDetails,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct OllamaModelListResponse {
    pub models: Vec<OllamaRemoteModel>,
}

/// Encapsulation of Ollama's models API
pub struct OllamaModels<'c> {
    client: &'c Client<OllamaConfig>,
}

impl<'c> OllamaModels<'c> {
    pub fn new(client: &'c Client<OllamaConfig>) -> Self {
        Self { client }
    }

    /// Lists the available models
    pub async fn list(&self) -> Result<OllamaModelListResponse, OpenAIError> {
        let response: OllamaModelListResponse = self.client.get(OLLAMA_LIST_MODELS_PATH).await?;

        Ok(response)
    }
}
