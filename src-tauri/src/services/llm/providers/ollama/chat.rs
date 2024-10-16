use std::pin::Pin;

use async_openai::{config::Config, error::OpenAIError, Client};
use entity::entities::{
    contents::ContentType,
    conversations::OllamaOptions,
    messages::{MessageDTO, Roles},
};
use serde::{Deserialize, Serialize};
use tokio_stream::{Stream, StreamExt};

use super::config::OllamaConfig;
use crate::services::cache;

const OLLAMA_CHAT_PATH: &str = "/api/chat";

#[derive(Default, Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct OllamaMessageContent {
    pub content: String,
    pub images: Option<Vec<String>>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(tag = "role")]
#[serde(rename_all = "lowercase")]
pub enum OllamaMessage {
    User(OllamaMessageContent),
    Assistant(OllamaMessageContent),
    System(OllamaMessageContent),
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct OllamaChatCompletionRequestOptions {
    /// The size of the context window used to generate the next token. (Default: 2048)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_ctx: Option<u32>,

    /// Maximum number of tokens to predict when generating text. (Default: 128, -1 = infinite generation, -2 = fill context)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_predict: Option<i32>,

    /// The temperature of the model. Increasing the temperature will make the model answer more creatively. (Default: 0.8)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,

    /// Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (Default: 0.9)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,
}

impl Into<OllamaChatCompletionRequestOptions> for OllamaOptions {
    fn into(self) -> OllamaChatCompletionRequestOptions {
        OllamaChatCompletionRequestOptions {
            num_ctx: self.num_ctx,
            num_predict: self.num_predict,
            temperature: self.temperature,
            top_p: self.top_p,
        }
    }
}

#[derive(Clone, Serialize, Default, Debug, Deserialize, PartialEq)]
pub struct OllamaChatCompletionRequest {
    /// ID of the model to use.
    /// Required.
    pub model: String,

    /// A list of messages comprising the conversation so far.
    /// Required.
    pub messages: Vec<OllamaMessage>,

    /// Additional model parameters
    /// Optional
    /// Visit [Modelfile](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#parameter) page for details
    pub options: Option<OllamaChatCompletionRequestOptions>,

    /// If false the response will be returned as a single response object, rather than a stream of objects
    /// Defaults to true
    pub stream: Option<bool>,

    ///  Controls how long the model will stay loaded into memory following the request (default: 5m)
    /// Optional
    pub keep_alive: Option<String>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct OllamaChatCompletionResponse {
    pub model: String,
    pub created_at: String,
    pub message: Option<OllamaMessage>,
    pub done: bool,
    // fields below will only appear when stream is false
    // or in the last response object when stream is true
    pub total_duration: Option<u64>, // All durations are returned in nanoseconds.
    pub load_duration: Option<u64>,  // All durations are returned in nanoseconds.
    pub prompt_eval_count: Option<u32>,
    pub prompt_eval_duration: Option<u64>, // All durations are returned in nanoseconds.
    pub eval_count: Option<u32>,
    pub eval_duration: Option<u64>, // All durations are returned in nanoseconds.
}

pub type OllamaChatCompletionResponseStream =
    Pin<Box<dyn Stream<Item = Result<OllamaChatCompletionResponse, OpenAIError>> + Send>>;

/// Encapsulation of Ollama's chat API
pub struct OllamaChat<'c> {
    client: &'c Client<OllamaConfig>,
}

impl<'c> OllamaChat<'c> {
    pub fn new(client: &'c Client<OllamaConfig>) -> Self {
        Self { client }
    }

    /// Creates a model response for the given chat conversation.
    pub async fn create(
        &self,
        request: OllamaChatCompletionRequest,
    ) -> Result<OllamaChatCompletionResponse, OpenAIError> {
        if request.stream.is_some() && request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is true, use OllamaChat::create_stream".into(),
            ));
        }
        self.client.post(OLLAMA_CHAT_PATH, request).await
    }

    pub async fn create_stream(
        &self,
        mut request: OllamaChatCompletionRequest,
    ) -> Result<OllamaChatCompletionResponseStream, OpenAIError> {
        if request.stream.is_some() && !request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is false, use Chat::create".into(),
            ));
        }

        request.stream = Some(true);

        log::info!("Creating stream: request = {:?}", request);

        let res = self
            .client
            .http_client()
            .post(self.client.config().url(OLLAMA_CHAT_PATH))
            .query(&self.client.config().query())
            .headers(self.client.config().headers())
            .json(&request)
            .send()
            .await
            .map_err(|e| OpenAIError::from(e))?;

        let stream = res.bytes_stream().map(|res| match res {
            Ok(bytes) => {
                let resp = serde_json::from_slice::<OllamaChatCompletionResponse>(&bytes).map_err(
                    |e| OpenAIError::StreamError(format!("Failed to deserialize response: {}", e)),
                )?;
                Ok(resp)
            }
            Err(e) => Err(OpenAIError::StreamError(format!(
                "Failed to read from stream: {}",
                e
            ))),
        });

        Ok(Box::pin(stream))
    }
}

impl Into<OllamaMessage> for MessageDTO {
    fn into(self) -> OllamaMessage {
        message_to_ollama_request_message(self)
    }
}
pub fn message_to_ollama_request_message(message: MessageDTO) -> OllamaMessage {
    let mut content: OllamaMessageContent = OllamaMessageContent::default();

    message.content.into_iter().for_each(|c| match c.r#type {
        ContentType::Image => {
            if content.images.is_none() {
                content.images = Some(Vec::new());
            }
            content.images.as_mut().unwrap().push(
                cache::read_as_base64_with_mime(c.data.as_str(), c.mimetype.as_deref())
                    .map(|r| r.1)
                    .unwrap_or(String::default()),
            );
        }
        ContentType::Text => {
            content.content = c.data;
        }
    });
    match message.role.into() {
        Roles::User => {
            return OllamaMessage::User(content);
        }
        Roles::Bot => {
            return OllamaMessage::Assistant(content);
        }
        Roles::System => {
            return OllamaMessage::System(content);
        }
    }
}
