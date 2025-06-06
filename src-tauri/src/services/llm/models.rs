use super::providers::{
    claude::{config::ClaudeConfig, models::ClaudeModels}, 
    deepseek::{config::DeepseekConfig, models::DeepseekModels}, 
    ollama::{config::OllamaConfig, models::OllamaModels}, 
    openrouter::models::OpenrouterModels, 
    xai::{config::XaiConfig, models::XaiModels},
    google::{config::GoogleConfig, models::GoogleModels},
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
    ClaudeListModelsRequestExecutor(&'c Client<ClaudeConfig>),
    GoogleListModelsRequestExecutor(&'c Client<GoogleConfig>),
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

    pub fn claude(client: &'c Client<ClaudeConfig>) -> Self {
        return ListModelsRequestExecutor::ClaudeListModelsRequestExecutor(client);
    }

    pub fn google(client: &'c Client<GoogleConfig>) -> Self {
        return ListModelsRequestExecutor::GoogleListModelsRequestExecutor(client);
    }

    pub async fn execute(&self) -> Result<Vec<RemoteModel>, String> {
        match self {
            ListModelsRequestExecutor::OpenAIListModelsRequestExecutor(client) => {
                let result = client
                    .models()
                    .list()
                    .await
                    .map_err(|err| {
                        log::error!("OpenAIListModelsRequestExecutor: {}", err);
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
                    log::error!("OllamaListModelsRequestExecutor: {}", err);
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
                    log::error!("OpenrouterListModelsRequestExecutor: {}", err);
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
                    log::error!("DeepseekListModelsRequestExecutor: {}", err);
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
                    log::error!("XaiListModelsRequestExecutor: {}", err);
                    String::from("Failed to list models")
                })?;
                let result = response
                    .data
                    .iter()
                    .map(|m| RemoteModel { id: m.id.clone() })
                    .collect();
                Ok(result)
            }
            ListModelsRequestExecutor::ClaudeListModelsRequestExecutor(client) => {
                let response = ClaudeModels::new(client).list().await.map_err(|err| {
                    log::error!("ClaudeListModelsRequestExecutor: {}", err);
                    String::from("Failed to list models")
                })?;
                let result = response
                    .data
                    .iter()
                    .map(|m| RemoteModel { id: m.display_name.clone() })
                    .collect();
                Ok(result)
            }
            ListModelsRequestExecutor::GoogleListModelsRequestExecutor(client) => {
                let response = GoogleModels::new(client).list().await.map_err(|err| {
                    log::error!("GoogleListModelsRequestExecutor: {}", err);
                    String::from("Failed to list models")
                })?;
                let result = response
                    .models
                    .iter()
                    .map(|m| RemoteModel { 
                        id: if m.name.starts_with("models/") {
                            m.name[7..].to_string()
                        } else {
                            m.name.clone()
                        }
                    })
                    .collect();
                Ok(result)
            }
        }
    }
}
