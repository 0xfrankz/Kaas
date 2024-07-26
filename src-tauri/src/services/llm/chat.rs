use async_openai::{Client, error::OpenAIError};
use serde::{Serialize, Deserialize};

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
pub struct  ClaudeResponseMessageTool {
    pub id: String,
    pub name: String,
    pub input: serde_json::Value
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
    name: String
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[serde(rename_all = "lowercase")]
pub enum ClaudeToolChoices {
    Auto,
    Any,
    Tool(ClaudeNamedTool)
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeTool {
    name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    input_schema: serde_json::Value
}

#[derive(Clone, Serialize, Debug, Deserialize, PartialEq)]
pub struct ClaudeUsage {
    pub input_tokens: u32,
    pub output_tokens: u32,
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

/// Given a list of messages comprising a conversation, the model will return a response.
pub struct ClaudeChat<'c> {
    client: &'c Client<ClaudeConfig>,
}

impl<'c> ClaudeChat<'c> {
    pub fn new(client: &'c Client<ClaudeConfig>) -> Self {
        Self { client }
    }

    pub async fn create(
        &self,
        request: ClaudeChatCompletionRequest
    ) -> Result<ClaudeChatCompletionResponse, OpenAIError> {
        if request.stream.is_some() && request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is true, use ClaudeChat::create_stream".into(),
            ));
        }
        self.client.post(CLAUDE_CHAT_PATH, request).await
    }
}