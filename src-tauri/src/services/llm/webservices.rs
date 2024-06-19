use async_openai::{
    config::{AzureConfig, Config, OpenAIConfig}, types::{
        ChatCompletionResponseStream, CreateChatCompletionRequest
    }, Client
};
use entity::entities::{conversations::ProviderOptions, messages::{MessageDTO, Model as Message}, models::{ProviderConfig, Providers}, settings::ProxySetting};
use reqwest;
use serde::Deserialize;

use super::utils::messages_and_options_to_request;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawAzureConfig {
    api_key: String,
    endpoint: String,
    api_version: String,
    deployment_id: String,
}

impl Into<AzureConfig> for RawAzureConfig {
    fn into(self) -> AzureConfig {
        AzureConfig::new()
            .with_api_base(self.endpoint)
            .with_api_version(self.api_version)
            .with_deployment_id(self.deployment_id)
            .with_api_key(self.api_key)
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RawOpenAIConfig {
    api_key: String,
    model: String,
    api_base: Option<String>,
    org_id: Option<String>,
}

impl Into<OpenAIConfig> for RawOpenAIConfig {
    fn into(self) -> OpenAIConfig {
        let mut config = OpenAIConfig::new()
            .with_api_key(self.api_key);
        if let Some(api_base) = self.api_base {
            config = config.with_api_base(api_base);
        }
        if let Some(org_id) = self.org_id {
            config = config.with_org_id(org_id);
        }

        return config;
    }
}

pub async fn complete_chat(messages: Vec<MessageDTO>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, default_max_tokens: Option<u16>) -> Result<String, String> {
    match config.provider.as_str().into() {
        Providers::Azure => {
            let (client, request) = build_azure_client_and_request(messages, options, config, proxy_setting, default_max_tokens)?;
            execute_chat_complete_request(client, request).await
        },
        Providers::OpenAI => {
            let (client, request) = build_openai_client_and_request(messages, options, config, proxy_setting, default_max_tokens)?;
            execute_chat_complete_request(client, request).await
        }
        _ => {
            return Err(format!("Complete chat with {} not implemented yet", config.provider));
        }
    }
}

async fn execute_chat_complete_request<C: Config>(client: Client<C>, request: CreateChatCompletionRequest) -> Result<String, String> {
    let response = client
        .chat()
        .create(request)
        .await
        .map_err(|err| {
            log::error!("execute_chat_complete_request: {}", err);
            format!("Failed to get chat completion response: {}", err)
        })?;

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

    Ok(message)
}

pub async fn complete_chat_stream(messages: Vec<MessageDTO>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, default_max_tokens: Option<u16>) -> Result<ChatCompletionResponseStream, String> {
    match config.provider.as_str().into() {
        Providers::Azure => {
            let (client, request) = build_azure_client_and_request(messages, options, config, proxy_setting, default_max_tokens)?;
            let stream = client.chat().create_stream(request).await.map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
            return Ok(stream);
        },
        Providers::OpenAI => {
            let (client, request) = build_openai_client_and_request(messages, options, config, proxy_setting, default_max_tokens)?;
            let stream = client.chat().create_stream(request).await.map_err(|err| format!("Error creating stream: {}", err.to_string()))?;
            return Ok(stream);
        },
        _ => {
            return Err(format!("Complete chat with {} not supported yet", config.provider.as_str()));
        }
    }
}

pub async fn list_models(provider: String, api_key: String, proxy_setting: Option<ProxySetting>) -> Result<Vec<async_openai::types::Model>, String> {
    let http_client = build_http_client(proxy_setting);
    match provider.as_str().into() {
        Providers::Azure => {
            let config = AzureConfig::default().with_api_key(api_key);
            let client = Client::with_config(config).with_http_client(http_client);
            list_models_with_client(client).await
        },
        Providers::OpenAI => {
            let config = OpenAIConfig::default().with_api_key(api_key);
            let client = Client::with_config(config).with_http_client(http_client);
            list_models_with_client(client).await
        },
        _ => {
            Err(format!("List models with {} not supported yet", provider))
        }
    }
}

async fn list_models_with_client<C: Config>(client: Client<C>) -> Result<Vec<async_openai::types::Model>, String> {
    let result = client
        .models()
        .list()
        .await
        .map_err(|err| {
            log::error!("list_models: {}", err);
            String::from("Failed to list models")
        })?
        .data;
    Ok(result)
}

/**
 * Build reqwest client with proxy
 */
fn build_http_client(proxy_setting: Option<ProxySetting>) -> reqwest::Client {
    let proxy_option: Option<reqwest::Proxy> = if let Some(setting) = proxy_setting {
        if setting.on {
            let proxy_option = if setting.http && setting.https {
                reqwest::Proxy::all(setting.server).ok()
            } else if setting.http {
                reqwest::Proxy::http(setting.server).ok()
            } else {
                reqwest::Proxy::https(setting.server).ok()
            };
            if let Some(proxy) = proxy_option {
                if let (Some(username), Some(password)) = (setting.username, setting.password) {
                    Some(proxy
                        .basic_auth(username.as_str(), password.as_str())
                    )
                } else {
                    Some(proxy.to_owned())
                }
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };
    let mut http_client_builder = reqwest::Client::builder();
    if let Some(proxy) = proxy_option {
        http_client_builder = http_client_builder.proxy(proxy);
    }
    http_client_builder.build().unwrap_or(reqwest::Client::new())
}

fn build_azure_client_and_request(messages: Vec<MessageDTO>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, default_max_tokens: Option<u16>) -> Result<(Client<AzureConfig>, CreateChatCompletionRequest), String> {
    let http_client = build_http_client(proxy_setting);
    let config_json: RawAzureConfig = serde_json::from_str(&config.config)
        .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
    let config: AzureConfig = config_json.into();
    let client = Client::with_config(config).with_http_client(http_client);
    let request = messages_and_options_to_request(messages, &options, default_max_tokens)?;
    Ok((client, request))
}

fn build_openai_client_and_request(messages: Vec<MessageDTO>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, default_max_tokens: Option<u16>) -> Result<(Client<OpenAIConfig>, CreateChatCompletionRequest), String> {
    let http_client = build_http_client(proxy_setting);
    let config_json: RawOpenAIConfig = serde_json::from_str(&config.config)
        .map_err(|_| format!("Failed to parse model config: {}", &config.config))?;
    let model = config_json.model.clone();
    let config: OpenAIConfig = config_json.into();
    let client = Client::with_config(config).with_http_client(http_client);
    let mut request = messages_and_options_to_request(messages, &options, default_max_tokens)?;
    request.model = model;
    Ok((client, request))
}