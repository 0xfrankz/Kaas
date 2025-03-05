use async_openai::{error::OpenAIError, Client};
use serde::{Deserialize, Serialize};
use super::config::ClaudeConfig;


const CLAUDE_LIST_MODELS_PATH: &str = "/v1/models";

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct ClaudeRemoteModel {
    pub id: String,
    pub created_at: String,
    pub display_name: String,
    pub r#type: String,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct ClaudeModelListResponse {
    pub data: Vec<ClaudeRemoteModel>,
}

pub struct ClaudeModels<'c> {
    client: &'c Client<ClaudeConfig>,
}

impl<'c> ClaudeModels<'c> {
    pub fn new(client: &'c Client<ClaudeConfig>) -> Self {
        Self { client }
    }

    pub async fn list(&self) -> Result<ClaudeModelListResponse, OpenAIError> {
        let response = self.client.get(CLAUDE_LIST_MODELS_PATH).await?;
        Ok(response)
    }
}
