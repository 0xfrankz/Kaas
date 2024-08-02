use std::pin::Pin;

use async_openai::{config::{AzureConfig, Config, OpenAIConfig}, error::OpenAIError, types::{ChatCompletionRequestMessage, ChatCompletionResponseStream, CreateChatCompletionRequest}, Client};
use entity::entities::{conversations::{AzureOptions, ClaudeOptions, GenericOptions, OllamaOptions, OpenAIOptions}, messages::MessageDTO};
use serde::{Deserialize, Serialize, de::DeserializeOwned};
use tokio_stream::{Stream, StreamExt};
use reqwest_eventsource::{Event, EventSource, RequestBuilderExt};
use crate::log_utils::warn;

use super::{config::{ClaudeConfig, OllamaConfig}, utils::{message_to_claude_request_message, message_to_ollama_request_message, message_to_openai_request_message, sum_option}};

const CLAUDE_CHAT_PATH: &str = "/messages";
const OLLAMA_CHAT_PATH: &str = "/api/chat";

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
    delta: ClaudeMessageDelta,
    usage: ClaudeUsage,
}

#[derive(Debug, Deserialize, Clone, PartialEq, Serialize)]
#[serde(tag = "type")]
#[serde(rename_all = "snake_case")]
pub enum ClaudeChatCompletionStreamResponse {
    ContentBlockDelta(ClaudeChatCompletionStreamContentBlockDelta),
    MessageDelta(ClaudeChatCompletionStreamMessageDelta)
}

pub type ClaudeChatCompletionResponseStream = 
    Pin<Box<dyn Stream<Item = Result<ClaudeChatCompletionStreamResponse, OpenAIError>> + Send>>;

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
    model: String,
    created_at: String,
    message: Option<OllamaMessage>,
    done: bool,
    // fields below will only appear when stream is false
    // or in the last response object when stream is true
    total_duration: Option<u64>, // All durations are returned in nanoseconds.
    load_duration: Option<u64>, // All durations are returned in nanoseconds.
    prompt_eval_count: Option<u32>,
    prompt_eval_duration: Option<u64>, // All durations are returned in nanoseconds.
    eval_count: Option<u32>,
    eval_duration: Option<u64>, // All durations are returned in nanoseconds.
}

pub type OllamaChatCompletionResponseStream = 
    Pin<Box<dyn Stream<Item = Result<OllamaChatCompletionResponse, OpenAIError>> + Send>>;

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
        request: OllamaChatCompletionRequest
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
        mut request: OllamaChatCompletionRequest
    ) -> Result<OllamaChatCompletionResponseStream, OpenAIError> {
        if request.stream.is_some() && !request.stream.unwrap() {
            return Err(OpenAIError::InvalidArgument(
                "When stream is false, use Chat::create".into(),
            ));
        }

        request.stream = Some(true);

        let event_source = self
            .client
            .http_client()
            .post(self.client.config().url(OLLAMA_CHAT_PATH))
            .query(&self.client.config().query())
            .headers(self.client.config().headers())
            .json(&request)
            .eventsource()
            .unwrap();

        Ok(claude_stream(event_source).await)
    }
}

pub enum ChatRequest<'c> {
    OpenAIChatRequest(&'c Client<OpenAIConfig>, CreateChatCompletionRequest),
    AzureChatRequest(&'c Client<AzureConfig>, CreateChatCompletionRequest),
    ClaudeChatRequest(&'c Client<ClaudeConfig>, ClaudeChatCompletionRequest),
    OllamaChatRequest(&'c Client<OllamaConfig>, OllamaChatCompletionRequest),
}

impl<'c> ChatRequest<'c> {
    pub fn openai(client: &'c Client<OpenAIConfig>, messages: Vec<MessageDTO>, options: GenericOptions, global_settings: GlobalSettings, model: String) -> Result<ChatRequest, String> {
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
            // n: options.n,
            presence_penalty: options.presence_penalty,
            stream: options.stream,
            temperature: options.temperature,
            top_p: options.top_p,
            user: options.user,
            ..Default::default()
        };
        Ok(ChatRequest::OpenAIChatRequest(client, request))
    }

    pub fn azure(client: &'c Client<AzureConfig>, messages: Vec<MessageDTO>, options: GenericOptions, global_settings: GlobalSettings) -> Result<ChatRequest, String> {
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
            // n: options.n,
            presence_penalty: options.presence_penalty,
            stream: options.stream,
            temperature: options.temperature,
            top_p: options.top_p,
            user: options.user,
            ..Default::default()
        };
        Ok(ChatRequest::AzureChatRequest(client, request))
    }

    pub fn claude(client: &'c Client<ClaudeConfig>, messages: Vec<MessageDTO>, options: GenericOptions, global_settings: GlobalSettings, model: String) -> Result<ChatRequest, String> {
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

    pub fn ollama(client: &'c Client<OllamaConfig>, messages: Vec<MessageDTO>, options: GenericOptions, global_settings: GlobalSettings, model: String) -> Result<ChatRequest, String> {
        let request: OllamaChatCompletionRequest;
        // set messages
        let req_messages: Vec<OllamaMessage> = messages.into_iter().map(message_to_ollama_request_message).collect();
        // set options
        let options: OllamaOptions = serde_json::from_str(&options.options)
            .map_err(|_| format!("Failed to parse conversation options: {}", &options.options))?;
        // build request
        let stream = options.stream.clone();
        request = OllamaChatCompletionRequest {
            model: model.to_string(),
            messages: req_messages,
            options: Some(options.into()),
            stream,
            ..Default::default()
        };
        Ok(ChatRequest::OllamaChatRequest(client, request))
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
        let stream: ChatCompletionResponseStream = client
            .chat()
            .create_stream(request)
            .await
            .map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
        let result = stream.map(|item| {
            item.map(|resp| {
                let first_choice = resp.choices
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
                first_choice
            })
        });
        Ok(Box::pin(result))
    }

    pub async fn execute(&self) -> Result<BotReply, String> {
        let log_tag = "ChatRequest::execute";
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
                        log::error!("execute ChatRequest::ClaudeChatRequest: {:?}", err);
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

                Ok(BotReply {
                    message,
                    prompt_token: usage.input_tokens,
                    completion_token: usage.output_tokens,
                    total_token: sum_option(usage.input_tokens, usage.output_tokens),
                })
            },
            ChatRequest::OllamaChatRequest(client, request) => {
                let response = OllamaChat::new(client)
                    .create(request.clone())
                    .await
                    .map_err(|err| {
                        log::error!("execute ChatRequest::OllamaChatRequest: {:?}", err);
                        format!("Failed to get chat completion response: {}", err)
                    })?;
                let message: String = match response.message {
                    Some(response_message) => match response_message{
                        OllamaMessage::Assistant(content) => content.content,
                        _ => {
                            warn(log_tag, "OllamaChat::create returned a non-assistant message");
                            String::default()
                        }
                    },
                    _ => {
                        warn(log_tag, "OllamaChat::create returned an empty message");
                        String::default()
                    }
                };
                // extract data & build reply
                Ok(BotReply {
                    message,
                    prompt_token: response.prompt_eval_count,
                    completion_token: response.eval_count,
                    total_token: sum_option(response.prompt_eval_count, response.eval_count),
                })
            }
        }
    }

    pub async fn execute_stream(&self) -> Result<BotReplyStream, String> {
        let log_tag = "ChatRequest::execute_stream";
        match self {
            ChatRequest::OpenAIChatRequest(client, request) => {
                return self.execute_openai_compatible_stream_request(client, request.clone()).await;
            },
            ChatRequest::AzureChatRequest(client, request) => {
                return self.execute_openai_compatible_stream_request(client, request.clone()).await;
            },
            ChatRequest::ClaudeChatRequest(client, request) => {
                let stream: ClaudeChatCompletionResponseStream = ClaudeChat::new(client)
                    .create_stream(request.clone())
                    .await
                    .map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
                let result = stream.map(|item| {
                    item.map(|resp| {
                        match resp {
                            ClaudeChatCompletionStreamResponse::ContentBlockDelta(content_delta) => {
                                BotReply {
                                    message: content_delta.delta.text.clone(),
                                    ..Default::default()
                                }
                            },
                            ClaudeChatCompletionStreamResponse::MessageDelta(message_delta) => {
                                // return empty string as message
                                BotReply {
                                    prompt_token: message_delta.usage.input_tokens,
                                    completion_token: message_delta.usage.output_tokens,
                                    total_token: sum_option(message_delta.usage.input_tokens, message_delta.usage.output_tokens),
                                    ..Default::default()
                                }
                            }
                        }
                    })
                });
                Ok(Box::pin(result))
            },
            ChatRequest::OllamaChatRequest(client, request) => {
                let stream: OllamaChatCompletionResponseStream = OllamaChat::new(client)
                    .create_stream(request.clone())
                    .await
                    .map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
                let result = stream.map(|item| {
                    item.map(|response| {
                        let message: String = match response.message {
                            Some(response_message) => match response_message{
                                OllamaMessage::Assistant(content) => content.content,
                                _ => {
                                    warn(log_tag, "OllamaChat::create_stream returned a non-assistant message");
                                    String::default()
                                }
                            },
                            _ => {
                                // normally the last message of the stream
                                String::default()
                            }
                        };

                        BotReply {
                            message,
                            prompt_token: response.prompt_eval_count,
                            completion_token: response.eval_count,
                            total_token: sum_option(response.prompt_eval_count, response.eval_count),
                        }
                    })
                });
                Ok(Box::pin(result))
            }
        }
    }
}

pub enum ClaudeStreamEvent<O: DeserializeOwned + std::marker::Send + 'static> {
    Open,
    Continue,
    Data(O),
    Stop,
    Error(String)
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
                },
                "message_stop" => {
                    ClaudeStreamEvent::Stop
                },
                "error" => {
                    // eventstream::Event doesn't support error event yet
                    ClaudeStreamEvent::Error(message.data)
                },
                _ => {
                    // Currently, treat all other event types as continue
                    ClaudeStreamEvent::Continue
                }
            }
        },
        Event::Open => {
            ClaudeStreamEvent::Open
        }
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
                            continue
                        },
                        ClaudeStreamEvent::Continue => {
                            log::info!("SSE: CONTINUE");
                            continue
                        },
                        ClaudeStreamEvent::Data(data) => {
                            if let Err(_e) = tx.send(Ok(data)) {
                                // rx dropped
                                break;
                            }
                        },
                        ClaudeStreamEvent::Stop => {
                            log::info!("SSE: STOP");
                            break
                        },
                        ClaudeStreamEvent::Error(err) => {
                            log::info!("SSE: ERROR: {}", err);
                            if let Err(_e) = tx.send(Err(OpenAIError::StreamError(err))) {
                                // rx dropped
                               break;
                            }
                        }
                    }
                    // Event::Message(message) => {
                    //     // if message.data == "[DONE]" {
                    //     //     break;
                    //     // }

                    //     // let response = match serde_json::from_str::<O>(&message.data) {
                    //     //     Err(e) => Err(map_deserialization_error(e, message.data.as_bytes())),
                    //     //     Ok(output) => Ok(output),
                    //     // };

                    //     // if let Err(_e) = tx.send(response) {
                    //     //     // rx dropped
                    //     //     break;
                    //     // }

                    //     log::info!("SSE: {:?}", message);
                    // }
                    // Event::Open => {
                    //     log::info!("SSE: OPEN");
                    //     continue
                    // },
                },
            }
        }
        log::info!("SSE: About to close");
        event_source.close();
    });

    Box::pin(tokio_stream::wrappers::UnboundedReceiverStream::new(rx))
}