use std::pin::Pin;

use async_openai::{error::OpenAIError, types::{ChatChoiceLogprobs, ChatCompletionRequestMessage, Role}, Client};
use serde::{Deserialize, Serialize};
use tokio_stream::Stream;

use crate::services::llm::providers::openai::chat::{OpenAIChatCompletionResponseFormat, OpenAIChatCompletionStreamOptions, Stop};

use super::config::DeepseekConfig;

const DEEPSEEK_CHAT_PATH: &str = "/chat/completions";

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum FinishReason {
    Stop,
    Length,
    ToolCalls,
    ContentFilter,
    InsufficientSystemResource,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ChatCompletionResponseMessage {
    pub content: Option<String>,
    pub reasoning_content: Option<String>,
    pub role: Option<Role>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ChatChoice {
    pub index: u32,
    pub message: ChatCompletionResponseMessage,
    pub finish_reason: Option<FinishReason>,
    pub logprobs: Option<ChatChoiceLogprobs>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ChatChoiceStream {
    pub index: u32,
    pub delta: ChatCompletionResponseMessage,
    pub finish_reason: Option<FinishReason>,
    pub logprobs: Option<ChatChoiceLogprobs>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct CompletionTokensDetails {
    pub reasoning_tokens: Option<u32>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct CompletionUsage {
    pub completion_tokens: u32,
    pub prompt_tokens: u32,
    pub prompt_cache_hit_tokens: u32,
    pub prompt_cache_miss_tokens: u32,
    pub total_tokens: u32,
    pub completion_tokens_details: Option<CompletionTokensDetails>,
}

#[derive(Clone, Serialize, Default, Debug, Deserialize, PartialEq)]
pub struct DeepseekChatCompletionRequest {
    pub messages: Vec<ChatCompletionRequestMessage>,
    pub model: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f32>, // min: -2.0, max: 2.0, default: 0
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f32>, // min: -2.0, max: 2.0, default 0
    #[serde(skip_serializing_if = "Option::is_none")]
    pub response_format: Option<OpenAIChatCompletionResponseFormat>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop: Option<Stop>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream_options: Option<OpenAIChatCompletionStreamOptions>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>, // min: 0, max: 2, default: 1,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>, // min: 0, max: 1, default: 1
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logprobs: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_logprobs: Option<u8>,
}

#[derive(Clone, Serialize, Default, Debug, Deserialize, PartialEq)]
pub struct DeepseekChatCompletionResponse {
    pub id: String,
    pub choices: Vec<ChatChoice>,
    pub created: u32,
    pub model: String,
    pub system_fingerprint: Option<String>,
    pub object: String,
    pub usage: Option<CompletionUsage>,
}

#[derive(Clone, Serialize, Default, Debug, Deserialize, PartialEq)]
pub struct DeepseekChatCompletionStreamResponse {
    pub id: String,
    pub choices: Vec<ChatChoiceStream>,
    pub created: u32,
    pub model: String,
    pub system_fingerprint: Option<String>,
    pub object: String,
    pub usage: Option<CompletionUsage>,
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
        if request.stream.is_some() && request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is true, use Chat::create_stream".into(),
            ));
        }
        self.client.post(DEEPSEEK_CHAT_PATH, request).await
    }

    pub async fn create_stream(&self, request: DeepseekChatCompletionRequest) -> Result<DeepseekChatCompletionResponseStream, OpenAIError> {
        if request.stream.is_some() && !request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is false, use Chat::create".into(),
            ));
        }
        Ok(self.client.post_stream(DEEPSEEK_CHAT_PATH, request).await)
    }
}
