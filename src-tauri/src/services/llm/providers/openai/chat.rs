use std::pin::Pin;

use async_openai::{config::Config, error::OpenAIError, types::ChatCompletionRequestMessage, Client};
use serde::{Deserialize, Serialize};
use tokio_stream::Stream;

use crate::services::llm::providers::types::{ChatCompletionRequestCommon, ChatCompletionResponseCommon, ChatChoice, ChatChoiceStream};

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct TopLogprobs {
    /// The token.
    pub token: String,
    /// The log probability of this token.
    pub logprob: f32,
    /// A list of integers representing the UTF-8 bytes representation of the token. Useful in instances where characters are represented by multiple tokens and their byte representations must be combined to generate the correct text representation. Can be `null` if there is no bytes representation for the token.
    pub bytes: Option<Vec<u8>>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ReasoningEffort {
    Low,
    Medium,
    High,
}

impl From<String> for ReasoningEffort {
    fn from(s: String) -> ReasoningEffort {
        match s.to_lowercase().as_str() {
            "low" => ReasoningEffort::Low,
            "medium" => ReasoningEffort::Medium,
            "high" => ReasoningEffort::High,
            _ => ReasoningEffort::Medium, // Default to Medium if input does not match any of the expected values
        }
    }
}

#[derive(Clone, Serialize, Default, Debug, Deserialize, PartialEq)]
pub struct OpenAIChatCompletionRequest {
    /// Common fields shared across different LLM providers
    #[serde(flatten)]
    pub common: ChatCompletionRequestCommon,

    /// A list of messages comprising the conversation so far. [Example Python code](https://cookbook.openai.com/examples/how_to_format_inputs_to_chatgpt_models).
    pub messages: Vec<ChatCompletionRequestMessage>, // min: 1

    #[serde(skip_serializing_if = "Option::is_none")]
    pub reasoning_effort: Option<ReasoningEffort>,

    ///  This feature is in Beta.
    /// If specified, our system will make a best effort to sample deterministically, such that repeated requests
    /// with the same `seed` and parameters should return the same result.
    /// Determinism is not guaranteed, and you should refer to the `system_fingerprint` response parameter to monitor changes in the backend.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<i64>,

    /// A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](https://platform.openai.com/docs/guides/safety-best-practices/end-user-ids).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<String>
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct OpenAIChatCompletionResponse {
    #[serde(flatten)]
    pub common: ChatCompletionResponseCommon,
    /// A list of chat completion choices. Can be more than one if `n` is greater than 1.
    pub choices: Vec<ChatChoice>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
/// Represents a streamed chunk of a chat completion response returned by model, based on the provided input.
pub struct OpenAIChatCompletionStreamResponse {
    #[serde(flatten)]
    pub common: ChatCompletionResponseCommon,
    /// A list of chat completion choices. Can contain more than one elements if `n` is greater than 1. Can also be empty for the last chunk if you set `stream_options: {"include_usage": true}`.
    pub choices: Vec<ChatChoiceStream>,
}

/// Parsed server side events stream until an \[DONE\] is received from server.
pub type OpenAIChatCompletionResponseStream =
    Pin<Box<dyn Stream<Item = Result<OpenAIChatCompletionStreamResponse, OpenAIError>> + Send>>;

pub struct OpenAIChat<'c, C: Config> {
    client: &'c Client<C>
}

impl<'c, C: Config> OpenAIChat<'c, C> {
    pub fn new(client: &'c Client<C>) -> Self {
        Self { client }
    }

    /// Creates a model response for the given chat conversation.
    pub async fn create(
        &self,
        request: OpenAIChatCompletionRequest,
    ) -> Result<OpenAIChatCompletionResponse, OpenAIError> {
        if request.common.stream.is_some() && request.common.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is true, use Chat::create_stream".into(),
            ));
        }
        self.client.post("/chat/completions", request).await
    }

    /// Creates a completion for the chat message
    pub async fn create_stream(
        &self,
        mut request: OpenAIChatCompletionRequest,
    ) -> Result<OpenAIChatCompletionResponseStream, OpenAIError> {
        if request.common.stream.is_some() && !request.common.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is false, use Chat::create".into(),
            ));
        }

        request.common.stream = Some(true);

        Ok(self.client.post_stream("/chat/completions", request).await)
    }
}