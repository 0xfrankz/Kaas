use async_openai::{error::OpenAIError, Client};
use serde::{Deserialize, Serialize};
use super::config::XaiConfig;

const XAI_LIST_MODELS_PATH: &str = "/v1/models";

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct XaiRemoteModel {
    pub id: String,
    pub created: u32,
    pub object: String,
    pub owned_by: String,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct XaiModelListResponse {
    pub object: String,
    pub data: Vec<XaiRemoteModel>,
}

pub struct XaiModels<'c> {
    client: &'c Client<XaiConfig>,
}

impl<'c> XaiModels<'c> {
    pub fn new(client: &'c Client<XaiConfig>) -> Self {
        Self { client }
    }

    pub async fn list(&self) -> Result<XaiModelListResponse, OpenAIError> {
        let response = self.client.get(XAI_LIST_MODELS_PATH).await?;
        Ok(response)
    }
}
