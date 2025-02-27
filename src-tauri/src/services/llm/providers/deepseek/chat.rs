use std::pin::Pin;

use async_openai::{error::OpenAIError, types::ChatCompletionRequestMessage, Client};
use serde::{Deserialize, Serialize};
use tokio_stream::Stream;

use crate::services::llm::providers::types::{ChatCompletionRequestCommon, ChatCompletionResponseCommon, ChatChoice, ChatChoiceStream};

use super::config::DeepseekConfig;

const DEEPSEEK_CHAT_PATH: &str = "/chat/completions";

#[derive(Clone, Serialize, Default, Debug, Deserialize, PartialEq)]
pub struct DeepseekChatCompletionRequest {
    /// Common fields shared across different LLM providers
    #[serde(flatten)]
    pub common: ChatCompletionRequestCommon,
    pub messages: Vec<ChatCompletionRequestMessage>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct DeepseekChatCompletionResponse {
    #[serde(flatten)]
    pub common: ChatCompletionResponseCommon,
    pub choices: Vec<ChatChoice>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct DeepseekChatCompletionStreamResponse {
    #[serde(flatten)]
    pub common: ChatCompletionResponseCommon,
    pub choices: Vec<ChatChoiceStream>,
} 

pub type DeepseekChatCompletionResponseStream =
    Pin<Box<dyn Stream<Item = Result<DeepseekChatCompletionStreamResponse, OpenAIError>> + Send>>;

pub struct DeepseekChat<'c> {
    client: &'c Client<DeepseekConfig>,
}

impl<'c> DeepseekChat<'c> {
    pub fn new(client: &'c Client<DeepseekConfig>) -> Self {
        Self { client }
    }

    pub async fn create(&self, request: DeepseekChatCompletionRequest) -> Result<DeepseekChatCompletionResponse, OpenAIError> {
        if request.common.stream.is_some() && request.common.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is true, use Chat::create_stream".into(),
            ));
        }
        self.client.post(DEEPSEEK_CHAT_PATH, request).await
    }

    pub async fn create_stream(&self, request: DeepseekChatCompletionRequest) -> Result<DeepseekChatCompletionResponseStream, OpenAIError> {
        if request.common.stream.is_some() && !request.common.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is false, use Chat::create".into(),
            ));
        }
        Ok(self.client.post_stream(DEEPSEEK_CHAT_PATH, request).await)
    }
}
