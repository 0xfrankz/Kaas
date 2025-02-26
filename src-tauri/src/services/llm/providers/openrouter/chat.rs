use std::pin::Pin;

use derive_builder::Builder;

use async_openai::{
    config::OpenAIConfig,
    error::OpenAIError,
    types::{
        ChatChoiceLogprobs, ChatCompletionRequestMessage
    },
    Client,
};
use serde::{Deserialize, Serialize};
use tokio_stream::Stream;

use crate::services::llm::providers::types::{
    ChatCompletionRequestCommon, ChatCompletionResponseCommon, Role, FinishReason, ChatChoice, ChatChoiceStream
};

const OPENROUTER_CHAT_PATH: &str = "/chat/completions";

#[derive(Clone, Serialize, Default, Debug, Builder, Deserialize, PartialEq)]
#[builder(name = "OpenrouterChatCompletionRequestBuilder")]
#[builder(pattern = "mutable")]
#[builder(setter(into, strip_option), default)]
#[builder(derive(Debug))]
pub struct OpenrouterChatCompletionRequest {
    /// Common fields shared across different LLM providers
    #[serde(flatten)]
    pub common: ChatCompletionRequestCommon,
    pub messages: Vec<ChatCompletionRequestMessage>, // min: 1
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub include_reasoning: Option<bool>,
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct OpenrouterChatCompletionResponse {
    #[serde(flatten)]
    pub common: ChatCompletionResponseCommon,
    pub choices: Vec<ChatChoice>,
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct OpenrouterChatCompletionStreamResponse {
    #[serde(flatten)]
    pub common: ChatCompletionResponseCommon,
    pub choices: Vec<ChatChoiceStream>,
}

pub type OpenrouterChatCompletionResponseStream =
    Pin<Box<dyn Stream<Item = Result<OpenrouterChatCompletionStreamResponse, OpenAIError>> + Send>>;

/// Encapsulation of OpenRouter's chat API
pub struct OpenrouterChat<'c> {
    client: &'c Client<OpenAIConfig>,
}

impl<'c> OpenrouterChat<'c> {
    pub fn new(client: &'c Client<OpenAIConfig>) -> Self {
        Self { client }
    }

    /// Creates a model response for the given chat conversation.
    pub async fn create(
        &self,
        request: OpenrouterChatCompletionRequest,
    ) -> Result<OpenrouterChatCompletionResponse, OpenAIError> {
        if request.common.stream.is_some() && request.common.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is true, use OllamaChat::create_stream".into(),
            ));
        }
        self.client.post(OPENROUTER_CHAT_PATH, request).await
    }

    /// Creates a completion for the chat message
    pub async fn create_stream(
        &self,
        mut request: OpenrouterChatCompletionRequest,
    ) -> Result<OpenrouterChatCompletionResponseStream, OpenAIError> {
        if request.common.stream.is_some() && !request.common.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is false, use Chat::create".into(),
            ));
        }

        request.common.stream = Some(true);

        Ok(self.client.post_stream(OPENROUTER_CHAT_PATH, request).await)
    }
}
