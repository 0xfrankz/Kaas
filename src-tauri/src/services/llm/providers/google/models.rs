use async_openai::{error::OpenAIError, Client};
use serde::Deserialize;

use super::config::GoogleConfig;

const GOOGLE_LIST_MODELS_PATH: &str = "/models";

#[derive(Clone, Debug, Default, PartialEq, Deserialize)]
pub struct GoogleRemoteModel {
    pub name: String,
    // pub base_model_id: String,
    // pub version: String,
    // pub display_name: String,
    // pub description: String,
    // pub input_token_limit: u32,
    // pub output_token_limit: u32,
    // pub supported_generation_methods: Vec<String>,
    // pub temperature: u32,
    // pub max_temperature: u32,
    // pub top_p: u32,
    // pub top_k: u32
}

#[derive(Clone, Debug, Default, PartialEq, Deserialize)]
pub struct GoogleModelListResponse {
    pub models: Vec<GoogleRemoteModel>,
}

pub struct GoogleModels<'c> {
    client: &'c Client<GoogleConfig>,
}

impl<'c> GoogleModels<'c> {
    pub fn new(client: &'c Client<GoogleConfig>) -> Self {
        Self { client }
    }

    pub async fn list(&self) -> Result<GoogleModelListResponse, OpenAIError> {
        let response = self.client.get(GOOGLE_LIST_MODELS_PATH).await?;
        log::info!("GoogleModelListResponse: {:#?}", response);
        Ok(response)
    }
}