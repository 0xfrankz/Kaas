use super::providers::{
    deepseek::{config::DeepseekConfig, models::DeepseekModels}, ollama::{config::OllamaConfig, models::OllamaModels}, openrouter::models::OpenrouterModels, xai::{config::XaiConfig, models::XaiModels}
};
use async_openai::{config::OpenAIConfig, Client};
use serde::Serialize;

#[derive(Clone, Debug, Default, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub struct RemoteModel {
    id: String,
}

pub enum ListModelsRequestExecutor<'c> {
    OpenAIListModelsRequestExecutor(&'c Client<OpenAIConfig>),
    OllamaListModelsRequestExecutor(&'c Client<OllamaConfig>),
    OpenrouterListModelsRequestExecutor(&'c Client<OpenAIConfig>),
    DeepseekListModelsRequestExecutor(&'c Client<DeepseekConfig>),
    XaiListModelsRequestExecutor(&'c Client<XaiConfig>),
}

impl<'c> ListModelsRequestExecutor<'c> {
    pub fn openai(client: &'c Client<OpenAIConfig>) -> Self {
        return ListModelsRequestExecutor::OpenAIListModelsRequestExecutor(client);
    }

    pub fn ollama(client: &'c Client<OllamaConfig>) -> Self {
        return ListModelsRequestExecutor::OllamaListModelsRequestExecutor(client);
    }

    pub fn openrouter(client: &'c Client<OpenAIConfig>) -> Self {
        return ListModelsRequestExecutor::OpenrouterListModelsRequestExecutor(client);
    }

    pub fn deepseek(client: &'c Client<DeepseekConfig>) -> Self {
        return ListModelsRequestExecutor::DeepseekListModelsRequestExecutor(client);
    }

    pub fn xai(client: &'c Client<XaiConfig>) -> Self {
        return ListModelsRequestExecutor::XaiListModelsRequestExecutor(client);
    }

    pub async fn execute(&self) -> Result<Vec<RemoteModel>, String> {
        match self {
            ListModelsRequestExecutor::OpenAIListModelsRequestExecutor(client) => {
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
            ListModelsRequestExecutor::OllamaListModelsRequestExecutor(client) => {
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
            ListModelsRequestExecutor::OpenrouterListModelsRequestExecutor(client) => {
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
            ListModelsRequestExecutor::DeepseekListModelsRequestExecutor(client) => {
                let response = DeepseekModels::new(client).list().await.map_err(|err| {
                    log::error!("ListModelsRequest::DeepseekListModelsRequest: {}", err);
                    String::from("Failed to list models")
                })?;
                let result = response
                    .data
                    .iter()
                    .map(|m| RemoteModel { id: m.id.clone() })
                    .collect();
                Ok(result)
            }
            ListModelsRequestExecutor::XaiListModelsRequestExecutor(client) => {
                let response = XaiModels::new(client).list().await.map_err(|err| {
                    log::error!("ListModelsRequest::XaiListModelsRequest: {}", err);
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
