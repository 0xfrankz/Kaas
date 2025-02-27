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

use super::config::XaiConfig;

const XAI_CHAT_PATH: &str = "/v1/chat/completions";

#[derive(Clone, Serialize, Default, Debug, PartialEq)]
pub struct XaiChatCompletionRequest {
    /// Common fields shared across different LLM providers
    #[serde(flatten)]
    pub common: ChatCompletionRequestCommon,
    pub messages: Vec<ChatCompletionRequestMessage>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct XaiChatCompletionResponse {
    #[serde(flatten)]
    pub common: ChatCompletionResponseCommon,
    pub choices: Vec<ChatChoice>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct XaiChatCompletionStreamResponse {
    #[serde(flatten)]
    pub common: ChatCompletionResponseCommon,
    pub choices: Vec<ChatChoiceStream>,
} 

pub type XaiChatCompletionResponseStream =
    Pin<Box<dyn Stream<Item = Result<XaiChatCompletionStreamResponse, OpenAIError>> + Send>>;

pub struct XaiChat<'c> {
    client: &'c Client<XaiConfig>,
}

impl<'c> XaiChat<'c> {
    pub fn new(client: &'c Client<XaiConfig>) -> Self {
        Self { client }
    }

    pub async fn create(&self, request: XaiChatCompletionRequest) -> Result<XaiChatCompletionResponse, OpenAIError> {
        if request.common.stream.is_some() && request.common.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is true, use Chat::create_stream".into(),
            ));
        }

        self.client.post(XAI_CHAT_PATH, request).await
    }

    pub async fn create_stream(&self, request: XaiChatCompletionRequest) -> Result<XaiChatCompletionResponseStream, OpenAIError> {
        if request.common.stream.is_some() && !request.common.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is false, use Chat::create".into(),
            ));
        }
        Ok(self.client.post_stream(XAI_CHAT_PATH, request).await)
    }
}