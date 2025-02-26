use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ChatCompletionStreamOptions {
    /// If set, an additional chunk will be streamed before the `data: [DONE]` message. The `usage` field on this chunk shows the token usage statistics for the entire request, and the `choices` field will always be an empty array. All other chunks will also include a `usage` field, but with a null value.
    pub include_usage: bool,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ChatCompletionResponseFormat {
    /// Setting to `json_object` enables JSON mode. This guarantees that the message the model generates is valid JSON.
    ///
    /// Note that your system prompt must still instruct the model to produce JSON, and to help ensure you don't forget,
    /// the API will throw an error if the string `JSON` does not appear in your system message. Also note that the message
    /// content may be partial (i.e. cut off) if `finish_reason="length"`, which indicates the generation
    /// exceeded `max_tokens` or the conversation exceeded the max context length.
    ///
    /// Must be one of `text` or `json_object`.
    pub r#type: ChatCompletionResponseFormatType,
}

/// Common fields shared across different LLM provider chat completion requests
#[derive(Clone, Serialize, Default, Debug, Deserialize, PartialEq)]
pub struct ChatCompletionRequestCommon {
    /// ID of the model to use.
    pub model: String,

    /// Whether to incrementally stream the response.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream_options: Option<ChatCompletionStreamOptions>,

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

    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f32>, // min: -2.0, max: 2.0, default: 0

    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f32>, // min: -2.0, max: 2.0, default 0

    #[serde(skip_serializing_if = "Option::is_none")]
    pub response_format: Option<ChatCompletionResponseFormat>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop: Option<Stop>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub logit_bias: Option<HashMap<String, serde_json::Value>>, // default: null

    #[serde(skip_serializing_if = "Option::is_none")]
    pub logprobs: Option<bool>,
    
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_logprobs: Option<u8>,
}

/// Common fields shared across different LLM provider chat completion responses
#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct ChatCompletionResponseCommon {
    /// A unique identifier for the chat completion.
    pub id: String,
    
    /// The Unix timestamp (in seconds) of when the chat completion was created.
    /// Claude does not return this field.
    pub created: Option<u32>,
    
    /// The model used for the chat completion.
    pub model: String,
    
    /// This fingerprint represents the backend configuration that the model runs with.
    /// Can be used in conjunction with the `seed` request parameter to understand when backend changes have been made that might impact determinism.
    pub system_fingerprint: Option<String>,
    
    /// The object type, which is always specific to the provider (e.g., "chat.completion").
    pub object: Option<String>,
    
    /// Usage statistics for the completion request.
    pub usage: Option<CompletionUsage>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ResponseFormat {
    pub r#type: ResponseFormatType,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct CompletionTokensDetails {
    pub accepted_prediction_tokens: Option<u32>,
    pub audio_tokens:  Option<u32>,
    pub reasoning_tokens: Option<u32>,
    pub rejected_prediction_tokens: Option<u32>
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct PromptTokensDetails {
    pub audio_tokens: Option<u32>,
    pub cached_tokens: Option<u32>
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

    /// Number of tokens in the prompt that were cached. Used by Deepseek
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prompt_cache_hit_tokens: Option<u32>,

    /// Used by Deepseek
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prompt_cache_miss_tokens: Option<u32>,
    
    /// Number of tokens used for reasoning, if supported.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reasoning_tokens: Option<u32>,

    /// Number of tokens used for reasoning, if supported. Used by Deepseek
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completion_tokens_details: Option<CompletionTokensDetails>,

    // Used by OpenAI
    pub prompt_tokens_details: Option<PromptTokensDetails>
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ChatChoice {
    pub index: u32,
    pub message: ChatChoiceMessage,
    pub finish_reason: Option<FinishReason>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ChatChoiceStream {
    /// The index of the choice in the list of choices.
    pub index: u32,
    pub delta: ChatChoiceMessage,
    pub finish_reason: Option<FinishReason>,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
pub struct ChatChoiceMessage {
    pub content: Option<String>,
    #[serde(alias="reasoning_content")] // Deepseek uses this alias
    pub reasoning: Option<String>,
    pub role: Option<Role>,
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
    Error,
}

/// Shared response format types
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ResponseFormatType {
    Text,
    JsonObject,
}

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ChatCompletionResponseFormatType {
    Text,
    JsonObject,
}