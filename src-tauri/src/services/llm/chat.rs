use std::pin::Pin;

use async_openai::{config::{AzureConfig, Config, OpenAIConfig}, error::OpenAIError, types::{ChatCompletionRequestMessage, ChatCompletionResponseStream, CreateChatCompletionRequest, CreateChatCompletionStreamResponse}, Chat, Client};
use entity::entities::{conversations::{AzureOptions, ClaudeOptions, OpenAIOptions, ProviderOptions}, messages::MessageDTO};
use serde::{Serialize, Deserialize};
use tokio_stream::{Stream, StreamExt};

use super::{config::ClaudeConfig, utils::{message_to_claude_request_message, message_to_openai_request_message}};

const CLAUDE_CHAT_PATH: &str = "/messages";

#[derive(Clone, Debug, Default, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub struct BotReply {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub prompt_token: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub completion_token: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub total_token: Option<u32>,
}

pub type BotReplyStream = Pin<Box<dyn Stream<Item = Result<BotReply, OpenAIError>> + Send>>;

pub struct GlobalSettings {
    pub max_tokens: u32,
}

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

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
pub struct ClaudeChatCompletionStreamResponse {

}

pub type ClaudeChatCompletionResponseStream = 
    Pin<Box<dyn Stream<Item = Result<ClaudeChatCompletionStreamResponse, OpenAIError>> + Send>>;

/// Given a list of messages comprising a conversation, the model will return a response.
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
        request: ClaudeChatCompletionRequest
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
        mut request: ClaudeChatCompletionRequest
    ) -> Result<ClaudeChatCompletionResponseStream, OpenAIError> {
        if request.stream.is_some() && !request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is false, use Chat::create".into(),
            ));
        }

        request.stream = Some(true);

        let event_source = self
            .client
            .http_client
            .post(self.client.config.url(CLAUDE_CHAT_PATH))
            .query(&self.client.config.query())
            .headers(self.client.config.headers())
            .json(&request)
            .eventsource()
            .unwrap();

        todo!();
    }
}

pub enum ChatRequest<'c> {
    OpenAIChatRequest(&'c Client<OpenAIConfig>, CreateChatCompletionRequest),
    AzureChatRequest(&'c Client<AzureConfig>, CreateChatCompletionRequest),
    ClaudeChatRequest(&'c Client<ClaudeConfig>, ClaudeChatCompletionRequest),
}

impl<'c> ChatRequest<'c> {
    pub fn openai(client: &'c Client<OpenAIConfig>, messages: Vec<MessageDTO>, options: ProviderOptions, global_settings: GlobalSettings, model: String) -> Result<ChatRequest, String> {
        let request: CreateChatCompletionRequest;
        // set messages
        let req_messages: Vec<ChatCompletionRequestMessage> = messages.into_iter().map(message_to_openai_request_message).collect();
        // set options
        let options: OpenAIOptions = serde_json::from_str(&options.options)
            .map_err(|_| format!("Failed to parse conversation options: {}", &options.options))?;
        // build request
        request = CreateChatCompletionRequest {
            model: model.to_string(),
            messages: req_messages,
            frequency_penalty: options.frequency_penalty,
            max_tokens: options.max_tokens.or(Some(global_settings.max_tokens)),
            n: options.n,
            presence_penalty: options.presence_penalty,
            stream: options.stream,
            temperature: options.temperature,
            top_p: options.top_p,
            user: options.user,
            ..Default::default()
        };
        Ok(ChatRequest::OpenAIChatRequest(client, request))
    }

    pub fn azure(client: &'c Client<AzureConfig>, messages: Vec<MessageDTO>, options: ProviderOptions, global_settings: GlobalSettings) -> Result<ChatRequest, String> {
        let request: CreateChatCompletionRequest;
        // set messages
        let req_messages: Vec<ChatCompletionRequestMessage> = messages.into_iter().map(message_to_openai_request_message).collect();
        // set options
        let options: AzureOptions = serde_json::from_str(&options.options)
            .map_err(|_| format!("Failed to parse conversation options: {}", &options.options))?;
        // build request
        request = CreateChatCompletionRequest {
            messages: req_messages,
            frequency_penalty: options.frequency_penalty,
            max_tokens: options.max_tokens.or(Some(global_settings.max_tokens)),
            n: options.n,
            presence_penalty: options.presence_penalty,
            stream: options.stream,
            temperature: options.temperature,
            top_p: options.top_p,
            user: options.user,
            ..Default::default()
        };
        Ok(ChatRequest::AzureChatRequest(client, request))
    }

    pub fn claude(client: &'c Client<ClaudeConfig>, messages: Vec<MessageDTO>, options: ProviderOptions, global_settings: GlobalSettings, model: String) -> Result<ChatRequest, String> {
        let request: ClaudeChatCompletionRequest;
        // set messages
        let req_messages: Vec<ClaudeMessage> = messages.into_iter().map(message_to_claude_request_message).collect();
        // set options
        let options: ClaudeOptions = serde_json::from_str(&options.options)
            .map_err(|_| format!("Failed to parse conversation options: {}", &options.options))?;
        // build request
        request = ClaudeChatCompletionRequest {
            model: model.to_string(),
            messages: req_messages,
            max_tokens: options.max_tokens.unwrap_or(global_settings.max_tokens),
            stream: options.stream,
            temperature: options.temperature,
            top_p: options.top_p,
            metadata: options.user.map(|user| {
                ClaudeMetadata {
                    user_id: user,
                }
            }),
            ..Default::default()
        };
        Ok(ChatRequest::ClaudeChatRequest(client, request))
    }

    async fn execute_openai_compatible_request<C: Config>(&self, client: &Client<C>, request: CreateChatCompletionRequest) -> Result<BotReply, String> {
        let response = client
            .chat()
            .create(request)
            .await
            .map_err(|err| {
                log::error!("execute_chat_complete_request: {:?}", err);
                format!("Failed to get chat completion response: {}", err)
            })?;
        // extract data & build reply
        let choice = response
            .choices
            .first()
            .ok_or("Api returned empty choices".to_string())?;
        let message = choice
            .message
            .content
            .as_ref()
            .ok_or("Api returned empty message".to_string())?
            .to_string();
        let usage = response.usage;
        let reply = BotReply {
            message,
            prompt_token: usage.as_ref().map(|usage| usage.prompt_tokens),
            completion_token: usage.as_ref().map(|usage| usage.completion_tokens),
            total_token: usage.as_ref().map(|usage| usage.total_tokens),
        };

        return Ok(reply)
    }

    async fn execute_openai_compatible_stream_request<C: Config>(&self, client: &Client<C>, request: CreateChatCompletionRequest) -> Result<BotReplyStream, String> {
        let stream: ChatCompletionResponseStream = client.chat().create_stream(request).await.map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
        let result = stream.map(|item| {
            item.map(|resp| {
                let result = resp.choices
                    .first()
                    .map_or(BotReply::default(), |choice| {
                        let usage = resp.usage.clone();
                        BotReply {
                            message: choice.delta.content.clone().unwrap_or(String::default()),
                            prompt_token: usage.as_ref().map(|usage| usage.prompt_tokens),
                            completion_token: usage.as_ref().map(|usage| usage.completion_tokens),
                            total_token: usage.as_ref().map(|usage| usage.total_tokens),
                        }
                    });
                result
            })
        });
        Ok(Box::pin(result))
    }

    pub async fn execute(&self) -> Result<BotReply, String> {
        match self {
            ChatRequest::OpenAIChatRequest(client, request) => {
                return self.execute_openai_compatible_request(client, request.clone()).await;
            },
            ChatRequest::AzureChatRequest(client, request) => {
                return self.execute_openai_compatible_request(client, request.clone()).await;
            },
            ChatRequest::ClaudeChatRequest(client, request) => {
                let response = ClaudeChat::new(client)
                    .create(request.clone())
                    .await
                    .map_err(|err| {
                        log::error!("execute_chat_complete_request: {:?}", err);
                        format!("Failed to get chat completion response: {}", err)
                    })?;
                // extract data & build reply
                let content = response
                    .content
                    .first()
                    .ok_or("Api returned empty content".to_string())?;
                let message = match content {
                    ClaudeResponseMessageContent::Text(text) => {
                        text.text.clone()
                    },
                    ClaudeResponseMessageContent::ToolUse(_) => "ToolUse is not implemented yet".to_string()
                };
                let usage = response.usage;
                let reply = BotReply {
                    message,
                    prompt_token: Some(usage.input_tokens),
                    completion_token: Some(usage.output_tokens),
                    total_token: Some(usage.input_tokens + usage.output_tokens),
                };
                
                return Ok(reply)
            }
        }
    }

    pub async fn execute_stream(&self) -> Result<BotReplyStream, String> {
        match self {
            ChatRequest::OpenAIChatRequest(client, request) => {
                return self.execute_openai_compatible_stream_request(client, request.clone()).await;
            },
            ChatRequest::AzureChatRequest(client, request) => {
                return self.execute_openai_compatible_stream_request(client, request.clone()).await;
            },
            ChatRequest::ClaudeChatRequest(client, request) => {
                todo!()
            }
        }
    }
}