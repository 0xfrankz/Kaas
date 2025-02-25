use serde::{Deserialize, Serialize};

/// Common fields shared across different LLM provider chat completion requests
#[derive(Clone, Serialize, Default, Debug, Deserialize, PartialEq)]
pub struct ChatCompletionRequestCommon {
    /// ID of the model to use.
    pub model: String,

    /// Whether to incrementally stream the response.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,

    /// Amount of randomness injected into the response (0.0 to 2.0).
    /// Higher values like 0.8 will make the output more random,
    /// while lower values like 0.2 will make it more focused and deterministic.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,

    /// Use nucleus sampling (0.0 to 1.0).
    /// Alternative to temperature, where the model considers the tokens with top_p probability mass.
    /// So 0.1 means only the tokens comprising the top 10% probability mass are considered.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,

    /// The maximum number of tokens to generate.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
}

/// Common stop sequence types across providers
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(untagged)]
pub enum Stop {
    String(String),
    StringArray(Vec<String>),
}

/// Generic finish reasons for completions
#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum FinishReason {
    Stop,
    Length,
    ToolCalls,
    ContentFilter,
    FunctionCall,
}

/// Shared response format types
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ResponseFormatType {
    Text,
    JsonObject,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ResponseFormat {
    pub r#type: ResponseFormatType,
}

/// Common usage statistics structure
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct CompletionUsage {
    /// Number of tokens in the prompt.
    pub prompt_tokens: u32,
    
    /// Number of tokens in the generated completion.
    pub completion_tokens: u32,
    
    /// Total number of tokens used in the request (prompt + completion).
    pub total_tokens: u32,
    
    /// Number of tokens used for reasoning, if supported.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reasoning_tokens: Option<u32>,
}

/// Shared streaming options
#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
pub struct ChatCompletionStreamOptions {
    /// If set, additional usage information will be included in the response.
    pub include_usage: bool,
}

/// Message role enum
#[derive(Clone, Debug, Serialize, Deserialize, Copy, Default, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    System,
    #[default]
    User,
    Assistant,
    Tool,
    Function,
}

/// Generic chat message content part
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(tag = "type")]
#[serde(rename_all = "lowercase")]
pub enum MessageContentPart {
    Text { text: String },
    Image { url: String },
}
