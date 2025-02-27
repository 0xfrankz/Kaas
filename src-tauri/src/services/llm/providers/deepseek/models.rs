use async_openai::{error::OpenAIError, Client};
use serde::{Deserialize, Serialize};
use super::config::DeepseekConfig;

const DEEPSEEK_LIST_MODELS_PATH: &str = "/models";

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct DeepseekRemoteModel {
    pub id: String,
    pub object: String,
    pub owned_by: String,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
pub struct DeepseekModelListResponse {
    pub object: String,
    pub data: Vec<DeepseekRemoteModel>,
}


pub struct DeepseekModels<'c> {
    client: &'c Client<DeepseekConfig>,
}

impl<'c> DeepseekModels<'c> {
    pub fn new(client: &'c Client<DeepseekConfig>) -> Self {
        Self { client }
    }

    pub async fn list(&self) -> Result<DeepseekModelListResponse, OpenAIError> {
        let response = self.client.get(DEEPSEEK_LIST_MODELS_PATH).await?;
        Ok(response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deserialize_model_list_response() {
        let json = r#"{
            "object": "list",
            "data": [
                {
                    "id": "deepseek-chat",
                    "object": "model", 
                    "owned_by": "deepseek"
                },
                {
                    "id": "deepseek-reasoner",
                    "object": "model",
                    "owned_by": "deepseek"
                }
            ]
        }"#;

        let response: DeepseekModelListResponse = serde_json::from_str(json).unwrap();

        assert_eq!(response.object, "list");
        assert_eq!(response.data.len(), 2);

        let first_model = &response.data[0];
        assert_eq!(first_model.id, "deepseek-chat");
        assert_eq!(first_model.object, "model");
        assert_eq!(first_model.owned_by, "deepseek");

        let second_model = &response.data[1];
        assert_eq!(second_model.id, "deepseek-reasoner");
        assert_eq!(second_model.object, "model");
        assert_eq!(second_model.owned_by, "deepseek");
    }
}


