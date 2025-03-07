use std::pin::Pin;

use async_openai::{error::OpenAIError, types::ChatCompletionRequestMessage, Client};
use serde::{Deserialize, Serialize};
use tokio_stream::Stream;

use crate::services::llm::providers::types::{
    ChatCompletionRequestCommon,
    ChatCompletionResponseCommon,
    ChatChoice,
    ChatChoiceStream,
};

use super::config::GoogleConfig;

const GOOGLE_CHAT_OPERATION: &str = "generateContent";
const GOOGLE_CHAT_STREAM_OPERATION: &str = "streamGenerateContent";

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub enum GoogleRole {
    User,
    Model,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GoogleChatCompletionContentPartFileData {
    pub mime_type: String,
    pub file_uri: String,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum GoogleChatCompletionContentPart {
    Text(String),
    FileData(GoogleChatCompletionContentPartFileData),
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GoogleChatCompletionContent {
    pub parts: Vec<GoogleChatCompletionContentPart>,
    pub role: GoogleRole,
}

#[derive(Default, Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GoogleChatCompletionRequestGenerationConfig {
    pub max_output_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub top_p: Option<f32>,
    pub top_k: Option<u32>,
    pub response_mime_type: Option<String>,
    pub stop_sequences: Option<Vec<String>>,
    pub presence_penalty: Option<f32>,
    pub frequency_penalty: Option<f32>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GoogleChatCompletionRequest {
    pub contents: Vec<GoogleChatCompletionContent>,
    pub system_instruction: Option<GoogleChatCompletionContent>,
    pub generation_config: Option<GoogleChatCompletionRequestGenerationConfig>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GoogleChatCompletionResponse {
    pub candidates: Vec<GoogleChatCompletionResponseCandidate>,
    pub usage_metadata: GoogleChatCompletionUsageMetadata,
    pub model_version: String
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GoogleChatCompletionResponseCandidate {
    pub content: GoogleChatCompletionContent,
    pub finish_reason: Option<GoogleChatCompletionFinishReason>,
    pub token_count: Option<u32>,
    pub index: u32,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct GoogleChatCompletionUsageMetadata {
    pub prompt_token_count: u32,
    pub cached_content_token_count: u32,
    pub candidates_token_count: u32,
    pub tool_use_prompt_token_count: u32,
    pub thoughts_token_count: u32,
    pub total_token_count: u32,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]

pub enum GoogleChatCompletionFinishReason {
    FinishReasonUnspecified,
    Stop,
    MaxTokens,
    Safety,
    Recitation,
    Language,
    Other,
    Blocklist,
    ProhibitedContent,
    Spii,
    MalformedFunctionCall,
    ImageSafety,
}

pub type GoogleChatCompletionResponseStream =
    Pin<Box<dyn Stream<Item = Result<GoogleChatCompletionResponse, OpenAIError>> + Send>>;

pub struct GoogleChat<'c> {
    client: &'c Client<GoogleConfig>,
}

impl<'c> GoogleChat<'c> {
    pub fn new(client: &'c Client<GoogleConfig>) -> Self {
        Self { client }
    }

    pub async fn create(&self, request: GoogleChatCompletionRequest) -> Result<GoogleChatCompletionResponse, OpenAIError> {
        let model = self.client.config().model.clone().ok_or(OpenAIError::InvalidArgument("Model is required".into()))?;

        let path = format!("/models/{}:{}", model, GOOGLE_CHAT_OPERATION);
        self.client.post(&path, request).await
    }

    pub async fn create_stream(&self, request: GoogleChatCompletionRequest) -> Result<GoogleChatCompletionResponseStream, OpenAIError> {
        let model = self.client.config().model.clone().ok_or(OpenAIError::InvalidArgument("Model is required".into()))?;

        let path = format!("/models/{}:{}", model, GOOGLE_CHAT_STREAM_OPERATION);
        Ok(self.client.post_stream(&path, request).await)
    }
}