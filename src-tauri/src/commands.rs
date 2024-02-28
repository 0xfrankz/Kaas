
use entity::entities::{model::Model, settings::Model as Setting};

use tauri::State;

use crate::{
  errors::CommandError::{self, ApiError, DbError}, services::{api, db::Repository}
};

type CommandResult<T = ()> = Result<T, CommandError>;

#[tauri::command]
pub async fn complete_chat_cmd() -> CommandResult<String> {
  let text = api::complete_chat().await.map_err(|message| ApiError{message})?;
  Ok(text)
}

#[tauri::command]
pub async fn create_model(model: Model, repo: State<'_, Repository>) -> CommandResult<Model> {
  let result = repo.create_model(model).await.map_err(|message| DbError{message})?;
  Ok(result)
}

#[tauri::command]
pub async fn list_models(repo: State<'_, Repository>) -> CommandResult<Vec<Model>> {
  let result = repo.list_models().await.map_err(|message| DbError{message})?;
  Ok(result)
}

#[tauri::command]
pub async fn list_settings(repo: State<'_, Repository>) -> CommandResult<Vec<Setting>> {
  let result = repo.list_settings().await.map_err(|message| DbError{message})?;
  Ok(result)
}