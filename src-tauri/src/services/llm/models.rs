use async_openai::{config::OpenAIConfig, error::OpenAIError, Client};
use serde::{Deserialize, Serialize};
use super::config::OllamaConfig;

const OLLAMA_LIST_MODELS_PATH: &str = "/api/tags";

#[derive(Clone, Debug, Default, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub struct RemoteModel {
    id: String
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct OllamaRemoteModelDetails {
    format: String,
    family: String,
    families: Option<Vec<String>>,
    parameter_size: String,
    quantization_level: String,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct OllamaRemoteModel {
    name: String,
    modified_at: String,
    size: u32,
    digest: String,
    details: OllamaRemoteModelDetails,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct OllamaRemoteModelList {
    models: Vec<OllamaRemoteModel>
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
    pub async fn list(&self) -> Result<Vec<RemoteModel>, OpenAIError> {
        let raw_model_list: OllamaRemoteModelList = self
            .client
            .get(OLLAMA_LIST_MODELS_PATH)
            .await?;
        let result = raw_model_list
            .models
            .iter()
            .map(|m| RemoteModel { id: m.name.clone() })
            .collect();
        Ok(result)
    }
}

pub enum ListModelsRequest<'c> {
    OpenAIListModelsRequest(&'c Client<OpenAIConfig>),
    OllamaListModelsRequest(&'c Client<OllamaConfig>),
}

impl<'c> ListModelsRequest<'c> {
    pub fn openai(client: &'c Client<OpenAIConfig>) -> Self {
        return ListModelsRequest::OpenAIListModelsRequest(client);
    }

    pub fn ollama(client: &'c Client<OllamaConfig>) -> Self {
        return ListModelsRequest::OllamaListModelsRequest(client);
    }

    pub async fn execute(&self) -> Result<Vec<RemoteModel>, String> {
        match self {
            ListModelsRequest::OpenAIListModelsRequest(client) => {
                let result = client
                    .models()
                    .list()
                    .await
                    .map_err(|err| {
                        log::error!("ListModelsRequest::OpenAIListModelsRequest: {}", err);
                        String::from("Failed to list models")
                    })?
                    .data
                    .iter()
                    .map(|m| RemoteModel { id: m.id.clone() })
                    .collect();
                Ok(result)
            }
            ListModelsRequest::OllamaListModelsRequest(client) => {
                let result = OllamaModels::new(client)
                    .list()
                    .await
                    .map_err(|err| {
                        log::error!("ListModelsRequest::OllamaListModelsRequest: {}", err);
                        String::from("Failed to list models")
                    })?;
                Ok(result)
            }
        }
    }
}