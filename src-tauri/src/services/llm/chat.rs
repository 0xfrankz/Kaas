use std::pin::Pin;

use crate::log_utils::warn;
use async_openai::{
    config::{AzureConfig, Config, OpenAIConfig},
    error::OpenAIError,
    types::{
        ChatChoice, ChatCompletionRequestMessage, ChatCompletionResponseStream, CompletionUsage,
        CreateChatCompletionRequest,
    },
    Client,
};
use entity::entities::{
    conversations::{AzureOptions, ClaudeOptions, GenericOptions, OllamaOptions, OpenAIOptions},
    messages::MessageDTO,
};
use serde::Serialize;
use tokio_stream::{Stream, StreamExt};

use super::{
    providers::{
        claude::{
            chat::{
                ClaudeChat, ClaudeChatCompletionRequest, ClaudeChatCompletionResponseStream,
                ClaudeChatCompletionStreamResponse, ClaudeMessage, ClaudeMetadata,
                ClaudeResponseMessageContent,
            },
            config::ClaudeConfig,
        },
        ollama::{
            chat::{
                OllamaChat, OllamaChatCompletionRequest, OllamaChatCompletionResponseStream,
                OllamaMessage,
            },
            config::OllamaConfig,
        },
        openrouter::chat::{OpenrouterChat, OpenrouterChatCompletionResponseStream},
    },
    utils::{message_to_openai_request_message, sum_option},
};

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

pub enum ChatRequest<'c> {
    OpenAIChatRequest(&'c Client<OpenAIConfig>, CreateChatCompletionRequest),
    AzureChatRequest(&'c Client<AzureConfig>, CreateChatCompletionRequest),
    ClaudeChatRequest(&'c Client<ClaudeConfig>, ClaudeChatCompletionRequest),
    OllamaChatRequest(&'c Client<OllamaConfig>, OllamaChatCompletionRequest),
    OpenrouterChatRequest(&'c Client<OpenAIConfig>, CreateChatCompletionRequest),
}

impl<'c> ChatRequest<'c> {
    pub fn openai(
        client: &'c Client<OpenAIConfig>,
        messages: Vec<MessageDTO>,
        options: GenericOptions,
        global_settings: GlobalSettings,
        model: String,
    ) -> Result<ChatRequest, String> {
        let request: CreateChatCompletionRequest;
        // set messages
        let req_messages: Vec<ChatCompletionRequestMessage> = messages
            .into_iter()
            .map(message_to_openai_request_message)
            .collect();
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

    pub fn azure(
        client: &'c Client<AzureConfig>,
        messages: Vec<MessageDTO>,
        options: GenericOptions,
        global_settings: GlobalSettings,
    ) -> Result<ChatRequest, String> {
        let request: CreateChatCompletionRequest;
        // set messages
        let req_messages: Vec<ChatCompletionRequestMessage> = messages
            .into_iter()
            .map(message_to_openai_request_message)
            .collect();
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

    pub fn claude(
        client: &'c Client<ClaudeConfig>,
        messages: Vec<MessageDTO>,
        options: GenericOptions,
        global_settings: GlobalSettings,
        model: String,
    ) -> Result<ChatRequest, String> {
        let request: ClaudeChatCompletionRequest;
        // set messages
        let req_messages: Vec<ClaudeMessage> = messages
            .into_iter()
            .map(Into::<ClaudeMessage>::into)
            .collect();
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
            metadata: options.user.map(|user| ClaudeMetadata { user_id: user }),
            ..Default::default()
        };
        Ok(ChatRequest::ClaudeChatRequest(client, request))
    }

    pub fn ollama(
        client: &'c Client<OllamaConfig>,
        messages: Vec<MessageDTO>,
        options: GenericOptions,
        _global_settings: GlobalSettings,
        model: String,
    ) -> Result<ChatRequest, String> {
        let request: OllamaChatCompletionRequest;
        // set messages
        let req_messages: Vec<OllamaMessage> = messages
            .into_iter()
            .map(Into::<OllamaMessage>::into)
            .collect();
        // set options
        let options: OllamaOptions = serde_json::from_str(&options.options)
            .map_err(|_| format!("Failed to parse conversation options: {}", &options.options))?;
        // build request
        // Stream must be set to false explictly for Ollama, or it will treat the request as a Stream request
        let stream = options.stream.clone().unwrap_or(false);
        request = OllamaChatCompletionRequest {
            model: model.to_string(),
            messages: req_messages,
            options: Some(options.into()),
            stream: Some(stream),
            ..Default::default()
        };
        Ok(ChatRequest::OllamaChatRequest(client, request))
    }

    pub fn openrouter(
        client: &'c Client<OpenAIConfig>,
        messages: Vec<MessageDTO>,
        options: GenericOptions,
        global_settings: GlobalSettings,
        model: String,
    ) -> Result<ChatRequest, String> {
        let request: CreateChatCompletionRequest;
        // set messages
        let req_messages: Vec<ChatCompletionRequestMessage> = messages
            .into_iter()
            .map(message_to_openai_request_message)
            .collect();
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
        Ok(ChatRequest::OpenrouterChatRequest(client, request))
    }

    fn convert_openai_compatible_response_data_to_botreply(
        &self,
        choices: Vec<ChatChoice>,
        usage: Option<CompletionUsage>,
    ) -> Result<BotReply, String> {
        let choice = choices
            .first()
            .ok_or("Api returned empty choices".to_string())?;
        let message = choice
            .message
            .content
            .as_ref()
            .ok_or("Api returned empty message".to_string())?
            .to_string();
        let reply = BotReply {
            message,
            prompt_token: usage.as_ref().map(|usage| usage.prompt_tokens),
            completion_token: usage.as_ref().map(|usage| usage.completion_tokens),
            total_token: usage.as_ref().map(|usage| usage.total_tokens),
        };

        Ok(reply)
    }

    async fn execute_openai_compatible_request<C: Config>(
        &self,
        client: &Client<C>,
        request: CreateChatCompletionRequest,
    ) -> Result<BotReply, String> {
        let response = client.chat().create(request).await.map_err(|err| {
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

        Ok(reply)
    }

    async fn execute_openai_compatible_stream_request<C: Config>(
        &self,
        client: &Client<C>,
        request: CreateChatCompletionRequest,
    ) -> Result<BotReplyStream, String> {
        let stream: ChatCompletionResponseStream = client
            .chat()
            .create_stream(request)
            .await
            .map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
        let result = stream.map(|item| {
            item.map(|resp| {
                let first_choice = resp.choices.first().map_or(BotReply::default(), |choice| {
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
                return self
                    .execute_openai_compatible_request(client, request.clone())
                    .await;
            }
            ChatRequest::AzureChatRequest(client, request) => {
                return self
                    .execute_openai_compatible_request(client, request.clone())
                    .await;
            }
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
                    ClaudeResponseMessageContent::Text(text) => text.text.clone(),
                    ClaudeResponseMessageContent::ToolUse(_) => {
                        "ToolUse is not implemented yet".to_string()
                    }
                };
                let usage = response.usage;

                Ok(BotReply {
                    message,
                    prompt_token: usage.input_tokens,
                    completion_token: usage.output_tokens,
                    total_token: sum_option(usage.input_tokens, usage.output_tokens),
                })
            }
            ChatRequest::OllamaChatRequest(client, request) => {
                let response = OllamaChat::new(client)
                    .create(request.clone())
                    .await
                    .map_err(|err| {
                        log::error!("execute ChatRequest::OllamaChatRequest: {:?}", err);
                        format!("Failed to get chat completion response: {}", err)
                    })?;
                let message: String = match response.message {
                    Some(response_message) => match response_message {
                        OllamaMessage::Assistant(content) => content.content,
                        _ => {
                            warn(
                                log_tag,
                                "OllamaChat::create returned a non-assistant message",
                            );
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
            ChatRequest::OpenrouterChatRequest(client, request) => {
                let response = OpenrouterChat::new(client)
                    .create(request.clone())
                    .await
                    .map_err(|err| {
                        log::error!("execute ChatRequest::OpenrouterChatRequest: {:?}", err);
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

                Ok(reply)
            }
        }
    }

    pub async fn execute_stream(&self) -> Result<BotReplyStream, String> {
        let log_tag = "ChatRequest::execute_stream";
        match self {
            ChatRequest::OpenAIChatRequest(client, request) => {
                return self
                    .execute_openai_compatible_stream_request(client, request.clone())
                    .await;
            }
            ChatRequest::AzureChatRequest(client, request) => {
                return self
                    .execute_openai_compatible_stream_request(client, request.clone())
                    .await;
            }
            ChatRequest::ClaudeChatRequest(client, request) => {
                let stream: ClaudeChatCompletionResponseStream = ClaudeChat::new(client)
                    .create_stream(request.clone())
                    .await
                    .map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
                let result = stream.map(|item| {
                    item.map(|resp| {
                        match resp {
                            ClaudeChatCompletionStreamResponse::ContentBlockDelta(
                                content_delta,
                            ) => BotReply {
                                message: content_delta.delta.text.clone(),
                                ..Default::default()
                            },
                            ClaudeChatCompletionStreamResponse::MessageDelta(message_delta) => {
                                // return empty string as message
                                BotReply {
                                    prompt_token: message_delta.usage.input_tokens,
                                    completion_token: message_delta.usage.output_tokens,
                                    total_token: sum_option(
                                        message_delta.usage.input_tokens,
                                        message_delta.usage.output_tokens,
                                    ),
                                    ..Default::default()
                                }
                            }
                        }
                    })
                });
                Ok(Box::pin(result))
            }
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
            ChatRequest::OpenrouterChatRequest(client, request) => {
                let stream: OpenrouterChatCompletionResponseStream = OpenrouterChat::new(&client)
                    .create_stream(request.clone())
                    .await
                    .map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
                let result = stream.map(|item| {
                    item.map(|resp| {
                        let first_choice =
                            resp.choices.first().map_or(BotReply::default(), |choice| {
                                let usage = resp.usage.clone();
                                BotReply {
                                    message: choice
                                        .delta
                                        .content
                                        .clone()
                                        .unwrap_or(String::default()),
                                    prompt_token: usage.as_ref().map(|usage| usage.prompt_tokens),
                                    completion_token: usage
                                        .as_ref()
                                        .map(|usage| usage.completion_tokens),
                                    total_token: usage.as_ref().map(|usage| usage.total_tokens),
                                }
                            });
                        first_choice
                    })
                });
                Ok(Box::pin(result))
            }
        }
    }
}
