use std::pin::Pin;

use async_openai::{
    config::OpenAIConfig,
    error::OpenAIError,
    types::{
        ChatChoiceLogprobs, ChatCompletionResponseMessage, ChatCompletionStreamResponseDelta,
        CompletionUsage, CreateChatCompletionRequest,
    },
    Client,
};
use serde::{Deserialize, Serialize};
use tokio_stream::Stream;

const OPENROUTER_CHAT_PATH: &str = "/chat/completions";

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ChatChoice {
    pub index: u32,
    pub message: ChatCompletionResponseMessage,
    pub finish_reason: Option<String>,
    pub logprobs: Option<ChatChoiceLogprobs>,
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct OpenrouterChatCompletionResponse {
    pub id: String,
    pub choices: Vec<ChatChoice>,
    pub created: u32,
    pub model: String,
    pub system_fingerprint: Option<String>,
    pub object: String,
    pub usage: Option<CompletionUsage>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ChatChoiceStream {
    pub index: u32,
    pub delta: ChatCompletionStreamResponseDelta,
    pub finish_reason: Option<String>,
    pub logprobs: Option<ChatChoiceLogprobs>,
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct OpenrouterChatCompletionStreamResponse {
    pub id: String,
    pub choices: Vec<ChatChoiceStream>,
    pub created: u32,
    pub model: String,
    pub system_fingerprint: Option<String>,
    pub object: String,
    pub usage: Option<CompletionUsage>,
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
        request: CreateChatCompletionRequest,
    ) -> Result<OpenrouterChatCompletionResponse, OpenAIError> {
        if request.stream.is_some() && request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is true, use OllamaChat::create_stream".into(),
            ));
        }
        self.client.post(OPENROUTER_CHAT_PATH, request).await
    }

    /// Creates a completion for the chat message
    pub async fn create_stream(
        &self,
        mut request: CreateChatCompletionRequest,
    ) -> Result<OpenrouterChatCompletionResponseStream, OpenAIError> {
        if request.stream.is_some() && !request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is false, use Chat::create".into(),
            ));
        }

        request.stream = Some(true);

        Ok(self.client.post_stream(OPENROUTER_CHAT_PATH, request).await)
    }
}
