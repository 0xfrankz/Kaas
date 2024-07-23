use async_openai::{config::Config, Client};

/// Extend async-openai::chat::Chat to provider more customability
pub struct KaasChat<'c, C: Config> {
    client: &'c Client<C>,
}

// impl<'c, C: Config> KaasChat<'c, C> {
//     pub fn new(client: &'c Client<C>) -> Self {
//         Self { client }
//     }

//     /// Creates a model response for the given chat conversation.
//     // pub async fn create(&self, request: CreateChatCompletionRequest, path: &str) -> Result<CreateChatCompletionResponse, OpenAIError> {
//     //     if request.stream.is_some() && request.stream.unwrap() {
//     //         return Err(OpenAIError::InvalidArgument(
//     //             "When stream is true, use Chat::create_stream".into(),
//     //         ));
//     //     }
//     //     self.client.post(path, request).await
//     // }
// }