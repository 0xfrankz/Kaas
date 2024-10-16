use super::providers::{
    ollama::{config::OllamaConfig, models::OllamaModels},
    openrouter::models::OpenrouterModels,
};
use async_openai::{config::OpenAIConfig, Client};
use serde::Serialize;

#[derive(Clone, Debug, Default, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub struct RemoteModel {
    id: String,
}

pub enum ListModelsRequest<'c> {
    OpenAIListModelsRequest(&'c Client<OpenAIConfig>),
    OllamaListModelsRequest(&'c Client<OllamaConfig>),
    OpenrouterListModelsRequest(&'c Client<OpenAIConfig>),
}

impl<'c> ListModelsRequest<'c> {
    pub fn openai(client: &'c Client<OpenAIConfig>) -> Self {
        return ListModelsRequest::OpenAIListModelsRequest(client);
    }

    pub fn ollama(client: &'c Client<OllamaConfig>) -> Self {
        return ListModelsRequest::OllamaListModelsRequest(client);
    }

    pub fn openrouter(client: &'c Client<OpenAIConfig>) -> Self {
        return ListModelsRequest::OpenrouterListModelsRequest(client);
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
                let response = OllamaModels::new(client).list().await.map_err(|err| {
                    log::error!("ListModelsRequest::OllamaListModelsRequest: {}", err);
                    String::from("Failed to list models")
                })?;
                let result = response
                    .models
                    .iter()
                    .map(|m| RemoteModel { id: m.name.clone() })
                    .collect();
                Ok(result)
            }
            ListModelsRequest::OpenrouterListModelsRequest(client) => {
                let response = OpenrouterModels::new(client).list().await.map_err(|err| {
                    log::error!("ListModelsRequest::OpenrouterListModelsRequest: {}", err);
                    String::from("Failed to list models")
                })?;
                let result = response
                    .data
                    .iter()
                    .map(|m| RemoteModel { id: m.id.clone() })
                    .collect();
                Ok(result)
            }
        }
    }
}
