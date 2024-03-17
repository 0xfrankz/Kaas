use std::{sync::{atomic::{AtomicBool, Ordering}, Arc, Mutex}, time::Instant};

use entity::entities::{
    conversations::{ConversationListItem, Model as Conversation, NewConversation}, 
    messages::{self, Model as Message, NewMessage}, 
    models::Model,
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
    let text = api::_complete_chat()
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
    new_conversation: NewConversation,
    repo: State<'_, Repository>,
) -> CommandResult<Conversation> {
    // Assemble conversation & message models
    let conversation = Conversation {
        model_id: new_conversation.model_id,
        subject: new_conversation.message.clone(),
        ..Default::default()
    };
    let message = Message {
        role: messages::Roles::from(0).into(), // first messge must be User message
        content: new_conversation.message,
        ..Default::default()
    };
    let (conversation, _) = repo
        .create_conversation_with_message(conversation, message)
        .await
        .map_err(|message| DbError { message })?;

    Ok(conversation)
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
pub async fn create_message(message: NewMessage, repo: State<'_, Repository>) -> CommandResult<Message> {
    let now = Instant::now();
    let result = repo
        .create_message(message)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::create_message]: {:.2?}", elapsed);
    Ok(result)
}

#[tauri::command]
pub async fn list_messages(conversation_id: i32, repo: State<'_, Repository>) -> CommandResult<Vec<Message>> {
    let now = Instant::now();
    let result = repo
        .list_messages(conversation_id)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::list_messages]: {:.2?}", elapsed);
    Ok(result)
}

#[tauri::command]
pub async fn call_bot(user_message: Message, window: tauri::Window, repo: State<'_, Repository>) -> CommandResult<String> {
    let now = Instant::now();
    let model = repo
        .get_model_of_message(&user_message)
        .await
        .map_err(|message| DbError { message })?;
    log::info!("Calling bot with message = {} and model = {:?}", user_message.content, model);
    let result = api::complete_chat(user_message.clone(), model.clone())
        .await
        .map_err(|message| ApiError { message })?;   
    // Retrieve model
    // Send request in a new thread
    // tokio::spawn(async move {
    //     let stop = Arc::new(AtomicBool::new(false));
    //     let stop_clone = Arc::clone(&stop);
    //     // Bind listener for cancel events
    //     let handler = window.listen("stop-bot", move |_| {
    //         stop_clone.store(true, Ordering::Release);
    //     });
    //     for _ in 1..10 {
    //         if stop.load(Ordering::Acquire) {
    //             log::info!("Breaking from thread");
    //             break;
    //         }
    //         std::thread::sleep(std::time::Duration::from_millis(1000));
    //         // emit a download progress event to all listeners registed in the webview
    //         match window.emit("bot-reply", "hello ") {
    //             Err(err) => log::error!("Error when receiving bot's replay: {}", err),
    //             _ => {}
    //         }
    //       }
    //     // Unbind listener for cancel events before thread ends
    //     window.unlisten(handler);
    // });
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::call_bot]: {:.2?}", elapsed);
    Ok(result)
}
