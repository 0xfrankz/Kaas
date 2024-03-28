use std::{sync::{atomic::{AtomicBool, Ordering}, Arc, Mutex}, time::Instant};

use entity::entities::{
    conversations::{ConversationListItem, Model as Conversation, NewConversation, ProviderOptions}, 
    messages::{self, Model as Message, NewMessage, Roles}, 
    models::Model,
    settings::Model as Setting,
};

use tauri::State;

use tokio_stream::StreamExt;

use crate::{
    errors::CommandError::{self, ApiError, DbError, StateError},
    services::{db::Repository, llm::{utils::{self, is_stream_enabled}, webservices as ws}},
};

type CommandResult<T = ()> = Result<T, CommandError>;

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
pub async fn call_bot(conversation_id: i32, window: tauri::Window, repo: State<'_, Repository>) -> CommandResult<()> {
    let now = Instant::now();
    // Retrieve message, options and config
    let last_message = repo
        .get_last_message(conversation_id)
        .await
        .map_err(|message| DbError { message })
        .and_then(|message| {
            // Error if the last message is not from user
            if message.role != Into::<i32>::into(Roles::User) {
                return Err(StateError { 
                    message: format!(
                        "The last message of conversation with id = {} is not from user", 
                        conversation_id
                    )
                });
            } else {
                return Ok(message);
            }
        })?;
    let options = repo
        .get_conversation_options(conversation_id)
        .await
        .map_err(|message| DbError { message })?;
    let config = repo
        .get_conversation_config(conversation_id)
        .await
        .map_err(|message| DbError { message })?;
    // Send request in a new thread
    tokio::spawn(async move {
        let stop = Arc::new(AtomicBool::new(false));
        let stop_clone = Arc::clone(&stop);
        // Bind listener for cancel events
        let handler = window.listen("stop-bot", move |_| {
            stop_clone.store(true, Ordering::Release);
        });
        // Invoke bot's API
        log::info!("Calling bot with message = {:?}, options ={:?} and config = {:?}", last_message, options, config);
        let is_stream_enabled = utils::is_stream_enabled(&options);
        if is_stream_enabled {
            // handle stream response
            let stream_result = ws::complete_chat_stream(last_message.clone(), options, config).await;
            match stream_result {
                Ok(mut stream) => {
                    log::info!("Streaming started!");
                    // start receiving in frontend
                    match window.emit("bot-reply", "[[START]]") {
                        Err(err) => {
                            log::error!("Error when sending event: {}", err);
                            // retry
                            let _ = window.emit("bot-reply", "[[START]]");
                        },
                        _ => {}
                    }
                    while let Some(result) = stream.next().await {
                        if stop.load(Ordering::Acquire) {
                            log::info!("Streaming stopped!");
                            match window.emit("bot-reply", "[[STOPPED]]") {
                                Err(err) => {
                                    log::error!("Error when sending event: {}", err);
                                    // retry
                                    let _ = window.emit("bot-reply", "[[STOPPED]]");
                                },
                                _ => {}
                            }
                            break;
                        }
                        match result {
                            Ok(response) => {
                                response.choices.iter().for_each(|chat_choice| {
                                    if let Some(ref content) = chat_choice.delta.content {
                                        let _ = window.emit("bot-reply", content.to_owned());
                                    }
                                });
                            }
                            Err(err) => {
                                let err_reply = format!("[[ERROR]]{}", err);
                                match window.emit("bot-reply", err_reply.clone()) {
                                    Err(err) => {
                                        log::error!("Error when sending event: {}", err);
                                        // retry
                                        let _ = window.emit("bot-reply", err_reply.clone());
                                    },
                                    _ => {}
                                }
                                break;
                            }
                        }
                    }
                    if !stop.load(Ordering::Acquire) {
                        match window.emit("bot-reply", "[[DONE]]") {
                            Err(err) => {
                                log::error!("Error when sending event: {}", err);
                                // retry
                                let _ = window.emit("bot-reply", "[[DONE]]");
                            },
                            _ => {}
                        }
                    }
                },
                Err(msg) => {
                    match window.emit("bot-reply", format!("[[ERROR]]{}", msg)) {
                        Err(err) => {
                            log::error!("Error when sending event: {}", err);
                            // retry
                            let _ = window.emit("bot-reply", format!("[[ERROR]]{}", msg));
                        },
                        _ => {}
                    }
                }
            }
        } else {
            // handle non-stream response
            let result = ws::complete_chat(last_message.clone(), options, config)
                .await;
            match result {
                Ok(reply) => {
                    match window.emit("bot-reply", reply.clone()) {
                        Err(err) => {
                            log::error!("Error when sending event: {}", err);
                            // retry
                            let _ = window.emit("bot-reply", reply.clone());
                        },
                        _ => {}
                    }
                    match window.emit("bot-reply", "[[DONE]]") {
                        Err(err) => {
                            log::error!("Error when sending event: {}", err);
                            // retry
                            let _ = window.emit("bot-reply", "[[DONE]]");
                        },
                        _ => {}
                    }
                },
                Err(msg) => {
                    let err_reply = format!("[[ERROR]]{}", msg);
                    match window.emit("bot-reply", err_reply.clone()) {
                        Err(err) => {
                            log::error!("Error when sending event: {}", err);
                            // retry
                            let _ = window.emit("bot-reply", err_reply.clone());
                        },
                        _ => {}
                    }
                }
            }
        }
        
        // Unbind listener for cancel events before thread ends
        window.unlisten(handler);
    });
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::call_bot]: {:.2?}", elapsed);
    Ok(())
}

#[tauri::command]
pub async fn get_options(conversation_id: i32, repo: State<'_, Repository>) -> CommandResult<ProviderOptions> {
    let now = Instant::now();
    let result = repo
        .get_conversation_options(conversation_id)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::get_options]: {:.2?}", elapsed);
    Ok(result)
}

#[tauri::command]
pub async fn update_options(conversation_id: i32, options: String, repo: State<'_, Repository>) -> CommandResult<ProviderOptions> {
    let now = Instant::now();
    let result = repo
        .update_conversation_options(conversation_id, options)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::update_options]: {:.2?}", elapsed);
    Ok(result)
}