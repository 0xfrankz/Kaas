use async_openai::{
    types::{
        ChatCompletionRequestUserMessageArgs, CreateChatCompletionRequestArgs,
    },
    Client,
    config::AzureConfig
};

pub async fn complete_chat() -> Result<String, String> {
    let config = AzureConfig::new()
        .with_api_base("<base_url>")
        .with_api_version("<api_version, required, check playground's demo code>")
        .with_deployment_id("<deployment_name>")
        .with_api_key("<api_key>");

    let client = Client::with_config(config);

    let request = CreateChatCompletionRequestArgs::default()
        .max_tokens(200_u16)
        .messages([
            ChatCompletionRequestUserMessageArgs::default()
                .content("what's your name?")
                .build()
                .map_err(|_| String::from("Failed to build Azure chat completion user message"))?
                .into()
        ])
        .build()
        .map_err(|_| String::from("Failed to build Azure chat completion request"))?;

    let response = client
        .chat()
        .create(request)
        .await
        .map_err(|_| String::from("Failed to get Azure chat completion response"))?;

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