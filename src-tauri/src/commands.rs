use std::time::Instant;

use entity::entities::{
    conversations::{ConversationListItem, Model as Conversation}, messages::Model as Message, models::Model,
    settings::Model as Setting,
};

use tauri::State;

use crate::{
    errors::CommandError::{self, ApiError, DbError},
    services::{api, db::Repository},
};

type CommandResult<T = ()> = Result<T, CommandError>;

#[tauri::command]
pub async fn complete_chat_cmd() -> CommandResult<String> {
    let text = api::complete_chat()
        .await
        .map_err(|message| ApiError { message })?;
    Ok(text)
}

#[tauri::command]
pub async fn create_model(model: Model, repo: State<'_, Repository>) -> CommandResult<Model> {
    let result = repo
        .create_model(model)
        .await
        .map_err(|message| DbError { message })?;
    Ok(result)
}

#[tauri::command]
pub async fn list_models(repo: State<'_, Repository>) -> CommandResult<Vec<Model>> {
    let result = repo
        .list_models()
        .await
        .map_err(|message| DbError { message })?;
    Ok(result)
}

#[tauri::command]
pub async fn list_settings(repo: State<'_, Repository>) -> CommandResult<Vec<Setting>> {
    let result = repo
        .list_settings()
        .await
        .map_err(|message| DbError { message })?;
    Ok(result)
}

#[tauri::command]
pub async fn upsert_setting(
    setting: Setting,
    repo: State<'_, Repository>,
) -> CommandResult<Setting> {
    let result = repo
        .upsert_settings(setting)
        .await
        .map_err(|message| DbError { message })?;
    Ok(result)
}

#[tauri::command]
pub async fn create_conversation(
    conversation: Conversation,
    repo: State<'_, Repository>,
) -> CommandResult<Conversation> {
    let result: Conversation = repo
        .create_conversation(conversation)
        .await
        .map_err(|message| DbError { message })?;
    Ok(result)
}

#[tauri::command]
pub async fn list_conversations(repo: State<'_, Repository>) -> CommandResult<Vec<ConversationListItem>> {
    let now = Instant::now();
    let result = repo
        .list_conversations()
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::list_conversations]: {:.2?}", elapsed);
    Ok(result)
}

#[tauri::command]
#[allow(dead_code)]
pub async fn create_message() -> CommandResult<Message> {
    todo!();
}
