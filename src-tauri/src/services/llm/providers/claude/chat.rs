use std::pin::Pin;

use async_openai::{config::Config, error::OpenAIError, Client};
use entity::entities::{
    contents::ContentType,
    messages::{MessageDTO, Roles},
};
use reqwest_eventsource::{Event, EventSource, RequestBuilderExt};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use tokio_stream::{Stream, StreamExt};

use crate::services::cache;

use super::config::ClaudeConfig;

const CLAUDE_CHAT_PATH: &str = "/messages";

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeMessageContentPartText {
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeImageSource {
    pub r#type: String,
    pub media_type: String,
    pub data: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeMessageContentPartImage {
    pub source: ClaudeImageSource,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(tag = "type")]
#[serde(rename_all = "lowercase")]
pub enum ClaudeMessageContentPart {
    Text(ClaudeMessageContentPartText),
    Image(ClaudeMessageContentPartImage),
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeResponseMessageText {
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeResponseMessageTool {
    pub id: String,
    pub name: String,
    pub input: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(untagged)]
pub enum ClaudeRequestMessageContent {
    /// Single text content of the message
    Text(String),
    /// An array of content parts with a defined type, each can be of type `text` or `image`
    Array(Vec<ClaudeMessageContentPart>),
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(tag = "type")]
#[serde(rename_all = "snake_case")]
pub enum ClaudeResponseMessageContent {
    /// Single text content of the message
    Text(ClaudeResponseMessageText),
    /// A tool that is to be used by the model
    ToolUse(ClaudeResponseMessageTool),
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeUserMessage {
    pub content: ClaudeRequestMessageContent,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ClaudeAssistantMessage {
    pub content: ClaudeRequestMessageContent,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(tag = "role")]
#[serde(rename_all = "lowercase")]
pub enum ClaudeMessage {
    User(ClaudeUserMessage),
    Assistant(ClaudeAssistantMessage),
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeMetadata {
    pub user_id: String,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeNamedTool {
    name: String,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[serde(rename_all = "lowercase")]
pub enum ClaudeToolChoices {
    Auto,
    Any,
    Tool(ClaudeNamedTool),
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeTool {
    name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    input_schema: serde_json::Value,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeUsage {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub input_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub output_tokens: Option<u32>,
}

#[derive(Clone, Serialize, Default, Debug, Deserialize, PartialEq)]
pub struct ClaudeChatCompletionRequest {
    /// ID of the model to use.
    /// Required.
    /// See the [Models](https://docs.anthropic.com/en/docs/about-claude/models) page for a list of available models.
    pub model: String,

    /// A list of messages comprising the conversation so far.
    /// Required.
    pub messages: Vec<ClaudeMessage>,

    /// The maximum number of tokens to generate before stopping.
    /// Required.
    pub max_tokens: u32,

    /// An object describing metadata about the request.
    /// metadata.user_id: An external identifier for the user who is associated with the request.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<ClaudeMetadata>,

    /// Custom text sequences that will cause the model to stop generating.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop_sequences: Option<Vec<String>>,

    /// Whether to incrementally stream the response using server-sent events.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,

    /// System prompt.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<String>,

    /// Amount of randomness injected into the response.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>, // min: 0, max: 1

    /// How the model should use the provided tools. The model can use a specific tool, any available tool, or decide by itself.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_choice: Option<ClaudeToolChoices>,

    /// Definitions of tools that the model may use.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tools: Option<Vec<ClaudeTool>>,

    /// Only sample from the top K options for each subsequent token.
    /// Recommended for advanced use cases only. You usually only need to use temperature.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_k: Option<u32>,

    /// Use nucleus sampling.
    /// Recommended for advanced use cases only. You usually only need to use temperature.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeChatCompletionResponse {
    /// Unique object identifier.
    pub id: String,

    /// Object type.
    /// For Messages, this is always "message".
    pub r#type: String,

    /// Conversational role of the generated message.
    /// This will always be "assistant".
    pub role: String,

    /// Content generated by the model.
    pub content: Vec<ClaudeResponseMessageContent>,

    /// The model that handled the request.
    pub model: String,

    /// The reason that we stopped.
    pub stop_reason: Option<String>,

    /// Which custom stop sequence was generated, if any.
    pub stop_sequence: Option<String>,

    /// Billing and rate-limit usage.
    pub usage: ClaudeUsage,
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct ContentBlockDelta {
    pub r#type: String,
    pub text: String,
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct ClaudeChatCompletionStreamContentBlockDelta {
    pub index: u32,
    pub delta: ContentBlockDelta,
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct ClaudeMessageDelta {
    stop_reason: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop_sequences: Option<Vec<String>>,
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct ClaudeChatCompletionStreamMessageDelta {
    pub delta: ClaudeMessageDelta,
    pub usage: ClaudeUsage,
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
#[serde(tag = "type")]
#[serde(rename_all = "snake_case")]
pub enum ClaudeChatCompletionStreamResponse {
    ContentBlockDelta(ClaudeChatCompletionStreamContentBlockDelta),
    MessageDelta(ClaudeChatCompletionStreamMessageDelta),
}

pub type ClaudeChatCompletionResponseStream =
    Pin<Box<dyn Stream<Item = Result<ClaudeChatCompletionStreamResponse, OpenAIError>> + Send>>;

pub enum ClaudeStreamEvent<O: DeserializeOwned + std::marker::Send + 'static> {
    Open,
    Continue,
    Data(O),
    Stop,
    Error(String),
}

fn parse_claude_stream_event<O>(event: Event) -> ClaudeStreamEvent<O>
where
    O: DeserializeOwned + std::marker::Send + 'static,
{
    match event {
        Event::Message(message) => {
            match message.event.as_str() {
                "content_block_delta" | "message_delta" => {
                    // content block data
                    let response = match serde_json::from_str::<O>(&message.data) {
                        Err(e) => ClaudeStreamEvent::Error(e.to_string()),
                        Ok(output) => ClaudeStreamEvent::Data(output),
                    };
                    response
                }
                "message_stop" => ClaudeStreamEvent::Stop,
                "error" => {
                    // eventstream::Event doesn't support error event yet
                    ClaudeStreamEvent::Error(message.data)
                }
                _ => {
                    // Currently, treat all other event types as continue
                    ClaudeStreamEvent::Continue
                }
            }
        }
        Event::Open => ClaudeStreamEvent::Open,
    }
}

/// Encapsulation of Claude's chat API
pub struct ClaudeChat<'c> {
    client: &'c Client<ClaudeConfig>,
}

impl<'c> ClaudeChat<'c> {
    pub fn new(client: &'c Client<ClaudeConfig>) -> Self {
        Self { client }
    }

    /// Creates a model response for the given chat conversation.
    pub async fn create(
        &self,
        request: ClaudeChatCompletionRequest,
    ) -> Result<ClaudeChatCompletionResponse, OpenAIError> {
        if request.stream.is_some() && request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is true, use ClaudeChat::create_stream".into(),
            ));
        }
        self.client.post(CLAUDE_CHAT_PATH, request).await
    }

    pub async fn create_stream(
        &self,
        mut request: ClaudeChatCompletionRequest,
    ) -> Result<ClaudeChatCompletionResponseStream, OpenAIError> {
        if request.stream.is_some() && !request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is false, use Chat::create".into(),
            ));
        }

        request.stream = Some(true);

        let event_source = self
            .client
            .http_client()
            .post(self.client.config().url(CLAUDE_CHAT_PATH))
            .query(&self.client.config().query())
            .headers(self.client.config().headers())
            .json(&request)
            .eventsource()
            .unwrap();

        Ok(claude_stream(event_source).await)
    }
}

/// Request Claude which responds with SSE.
/// [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format)
pub(crate) async fn claude_stream<O>(
    mut event_source: EventSource,
) -> Pin<Box<dyn Stream<Item = Result<O, OpenAIError>> + Send>>
where
    O: DeserializeOwned + std::marker::Send + 'static,
{
    let (tx, rx) = tokio::sync::mpsc::unbounded_channel();

    tokio::spawn(async move {
        while let Some(ev) = event_source.next().await {
            log::info!("SSE: {:?}", ev);
            match ev {
                Err(e) => {
                    if let Err(_e) = tx.send(Err(OpenAIError::StreamError(e.to_string()))) {
                        // rx dropped
                        break;
                    }
                }
                Ok(event) => {
                    match parse_claude_stream_event(event) {
                        ClaudeStreamEvent::Open => {
                            log::info!("SSE: OPEN");
                            continue;
                        }
                        ClaudeStreamEvent::Continue => {
                            log::info!("SSE: CONTINUE");
                            continue;
                        }
                        ClaudeStreamEvent::Data(data) => {
                            if let Err(_e) = tx.send(Ok(data)) {
                                // rx dropped
                                break;
                            }
                        }
                        ClaudeStreamEvent::Stop => {
                            log::info!("SSE: STOP");
                            break;
                        }
                        ClaudeStreamEvent::Error(err) => {
                            log::info!("SSE: ERROR: {}", err);
                            if let Err(_e) = tx.send(Err(OpenAIError::StreamError(err))) {
                                // rx dropped
                                break;
                            }
                        }
                    }
                }
            }
        }
        log::info!("SSE: About to close");
        event_source.close();
    });

    Box::pin(tokio_stream::wrappers::UnboundedReceiverStream::new(rx))
}

impl Into<ClaudeMessage> for MessageDTO {
    fn into(self) -> ClaudeMessage {
        message_to_claude_request_message(self)
    }
}

pub fn message_to_claude_request_message(message: MessageDTO) -> ClaudeMessage {
    let content_parts = message
        .content
        .into_iter()
        .map(|item| {
            let part: ClaudeMessageContentPart = match item.r#type {
                ContentType::Image => {
                    ClaudeMessageContentPart::Image(ClaudeMessageContentPartImage {
                        source: ClaudeImageSource {
                            r#type: "base64".to_string(),
                            media_type: item
                                .mimetype
                                .as_deref()
                                .unwrap_or("image/jpeg")
                                .to_string(),
                            data: cache::read_as_base64_with_mime(
                                item.data.as_str(),
                                item.mimetype.as_deref(),
                            )
                            .map(|r| r.1)
                            .unwrap_or(String::default()),
                        },
                    })
                }
                ContentType::Text => {
                    ClaudeMessageContentPart::Text(ClaudeMessageContentPartText { text: item.data })
                }
            };
            part
        })
        .collect::<Vec<ClaudeMessageContentPart>>();
    match message.role.into() {
        Roles::User => {
            return ClaudeMessage::User(ClaudeUserMessage {
                content: ClaudeRequestMessageContent::Array(content_parts),
            });
        }
        Roles::Bot => {
            return ClaudeMessage::Assistant(ClaudeAssistantMessage {
                content: ClaudeRequestMessageContent::Array(content_parts),
            });
        }
        _ => {
            panic!("Claude doesn't accept system message as part of context!")
        }
    }
}
