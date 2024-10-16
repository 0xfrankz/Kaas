use async_openai::{config::OpenAIConfig, error::OpenAIError, Client};
use serde::{Deserialize, Serialize};

const OPENROUTER_LIST_MODELS_PATH: &str = "/models";

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct OpenrouterRemoteModel {
    pub id: String,
    pub name: String,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct OpenrouterModelListResponse {
    pub data: Vec<OpenrouterRemoteModel>,
}

/// Encapsulation of OpenRouter's models API
pub struct OpenrouterModels<'c> {
    client: &'c Client<OpenAIConfig>,
}

impl<'c> OpenrouterModels<'c> {
    pub fn new(client: &'c Client<OpenAIConfig>) -> Self {
        Self { client }
    }

    /// Lists the available models
    pub async fn list(&self) -> Result<OpenrouterModelListResponse, OpenAIError> {
        let response: OpenrouterModelListResponse =
            self.client.get(OPENROUTER_LIST_MODELS_PATH).await?;

        Ok(response)
    }
}
