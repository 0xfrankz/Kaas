use std::{sync::{atomic::{AtomicBool, Ordering}, Arc}, time::Instant};

use entity::entities::{
    conversations::{ConversationListItem, Model as Conversation, NewConversation, ProviderOptions, DEFAULT_CONTEXT_LENGTH, DEFAULT_MAX_TOKENS}, 
    messages::{self, Model as Message, NewMessage, Roles}, 
    models::{Model, ProviderConfig},
    settings::{Model as Setting, ProxySetting, SETTING_MODELS_CONTEXT_LENGTH, SETTING_MODELS_MAX_TOKENS, SETTING_NETWORK_PROXY},
};

use tauri::State;
use tokio_stream::StreamExt;

use crate::{
    errors::CommandError::{self, ApiError, DbError, StateError},
    services::{db::Repository, llm::{utils::{self}, webservices as ws}},
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
        .upsert_setting(setting)
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
    // Retrieve options, config and settings
    let options = repo
        .get_conversation_options(conversation_id)
        .await
        .map_err(|message| DbError { message })?;
    let config = repo
        .get_conversation_config(conversation_id)
        .await
        .map_err(|message| DbError { message })?;
    let proxy_setting = repo
        .get_setting(SETTING_NETWORK_PROXY)
        .await
        .map(|setting| {
            if let Ok(p_setting) = serde_json::from_str::<ProxySetting>(&setting.value) {
                Some(p_setting)
            } else { 
                None
            }
        })
        .unwrap_or(None);
    let ctx_length_setting: u16 = repo
        .get_setting(SETTING_MODELS_CONTEXT_LENGTH)
        .await
        .map(|setting| {
            match setting.value.parse::<u16>() {
                Ok(value) => value,
                Err(_) => DEFAULT_CONTEXT_LENGTH,
            }
        })
        .unwrap_or(DEFAULT_CONTEXT_LENGTH);
    let max_token_setting: u16 = repo
        .get_setting(SETTING_MODELS_MAX_TOKENS)
        .await
        .map(|setting| {
            match setting.value.parse::<u16>() {
                Ok(value) => value,
                Err(_) => DEFAULT_MAX_TOKENS,
            }
        })
        .unwrap_or(DEFAULT_MAX_TOKENS);
    // Try to retrieve the context length from the conversation's options.
    // If unsuccessful, fall back to the default context length setting.
    let context_length = serde_json::from_str(&options.options)
        .map(|options_json: serde_json::Value| {
            if let Some(ctx_length) = options_json["contextLength"].as_u64() {
                u16::try_from(ctx_length).unwrap_or(ctx_length_setting)
            } else {
                ctx_length_setting
            }
        })
        .unwrap_or(ctx_length_setting);
    // Retrive message list
    let last_messages = repo
        .get_last_messages(conversation_id, context_length + 1) // plus one to get the last user's message
        .await
        .map_err(|message| DbError { message })?;
    // Build http client
    // Send request in a new thread
    // tokio::spawn(async move {
    //     let stop = Arc::new(AtomicBool::new(false));
    //     let stop_clone = Arc::clone(&stop);
    //     // Bind listener for cancel events
    //     let handler = window.listen("stop-bot", move |_| {
    //         stop_clone.store(true, Ordering::Release);
    //     });
    //     // Invoke bot's API
    //     log::info!("Calling bot with messages = {:?}, options ={:?} and config = {:?}", last_messages, options, config);
    //     let is_stream_enabled = utils::is_stream_enabled(&options);
    //     if is_stream_enabled {
    //         // handle stream response
    //         let stream_result = ws::complete_chat_stream(last_messages, options, config, proxy_setting, Some(max_token_setting)).await;
    //         match stream_result {
    //             Ok(mut stream) => {
    //                 log::info!("Streaming started!");
    //                 // start receiving in frontend
    //                 emit_stream_start(&window);
    //                 while let Some(result) = stream.next().await {
    //                     if stop.load(Ordering::Acquire) {
    //                         log::info!("Streaming stopped!");
    //                         emit_stream_stopped(&window);
    //                         break;
    //                     }
    //                     match result {
    //                         Ok(response) => {
    //                             response.choices.iter().for_each(|chat_choice| {
    //                                 if let Some(ref content) = chat_choice.delta.content {
    //                                     emit_stream_data(&window, content.to_owned());
    //                                 }
    //                             });
    //                         }
    //                         Err(err) => {
    //                             let err_reply = format!("[[ERROR]]{}", err);
    //                             emit_stream_error(&window, err_reply);
    //                             break;
    //                         }
    //                     }
    //                 }
    //                 if !stop.load(Ordering::Acquire) {
    //                     emit_stream_done(&window);
    //                 }
    //             },
    //             Err(msg) => {
    //                 emit_stream_error(&window, msg);
    //             }
    //         }
    //     } else {
    //         // handle non-stream response
    //         // start receiving in frontend
    //         emit_stream_start(&window);
    //         let result = ws::complete_chat(last_messages, options, config, proxy_setting, Some(max_token_setting))
    //             .await;
    //         match result {
    //             Ok(reply) => {
    //                 emit_stream_data(&window, reply);
    //                 emit_stream_done(&window);
    //             },
    //             Err(msg) => {
    //                 let err_reply = format!("[[ERROR]]{}", msg);
    //                 emit_stream_error(&window, err_reply);
    //             }
    //         }
    //     }
        
    //     // Unbind listener for cancel events before thread ends
    //     window.unlisten(handler);
    // });
    call_bot_one_off(window, last_messages, options, config, proxy_setting, max_token_setting).await;
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

#[tauri::command]
pub async fn update_subject(conversation_id: i32, subject: String, repo: State<'_, Repository>) -> CommandResult<String> {
    let now = Instant::now();
    let result = repo
        .update_conversation_subject(conversation_id, subject)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::update_subject]: {:.2?}", elapsed);
    Ok(result)
}

/***** Functions for calling model API START *****/
async fn call_bot_one_off(window: tauri::Window, messages: Vec<Message>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, max_token_setting: u16) {
    log::info!("call_bot_one_off");
    let window_clone = window.clone();
    let window_clone_2 = window.clone();
    let task_handle = tokio::spawn(async move {
        // handle non-stream response
        // start receiving in frontend
        emit_stream_start(&window);
        log::info!("call_bot_one_off: thread start");
        let result = ws::complete_chat(messages, options, config, proxy_setting, Some(max_token_setting))
            .await;
        match result {
            Ok(reply) => {
                log::info!("Bot call received: {}", reply);
                emit_stream_data(&window, reply);
                emit_stream_done(&window);
                log::info!("call_bot_one_off: thread done");
            },
            Err(msg) => {
                let err_reply = format!("[[ERROR]]{}", msg);
                emit_stream_error(&window, &err_reply);
                log::error!("call_bot_one_off: {}", &err_reply);
            }
        }
    });
    let abort_handle = task_handle.abort_handle();
    // Bind listener for cancel events
    let event_handle = window_clone.listen("stop-bot", move |_| {
        log::info!("Bot call stopped!");
        abort_handle.abort();
        emit_stream_stopped(&window_clone_2);
    });
    // Run task
    let _ = task_handle.await;
    // Unbind listener for cancel events before thread ends
    window_clone.unlisten(event_handle);

}

async fn call_bot_stream(window: tauri::Window, messages: Vec<Message>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, max_token_setting: u16) {
    log::info!("call_bot_stream");
    let window_clone = window.clone();
    let window_clone_2 = window.clone();
    let task_handle = tokio::spawn(async move {
        // handle stream response
        // start receiving in frontend
        emit_stream_start(&window);
        log::info!("call_bot_stream: thread start");
        let stream_result = ws::complete_chat_stream(messages, options, config, proxy_setting, Some(max_token_setting)).await;
        match stream_result {
            Ok(mut stream) => {
                log::info!("Streaming started!");
                while let Some(result) = stream.next().await {
                    log::info!("Streaming more data...");
                    match result {
                        Ok(response) => {
                            response.choices.iter().for_each(|chat_choice| {
                                if let Some(ref content) = chat_choice.delta.content {
                                    emit_stream_data(&window, content.to_owned());
                                }
                            });
                        }
                        Err(err) => {
                            let err_reply = format!("[[ERROR]]{}", err);
                            emit_stream_error(&window, &err_reply);
                            log::error!("call_bot_stream: Error during stream: {}", &err_reply);
                            break;
                        }
                    }
                }
            },
            Err(msg) => {
                let err_reply = format!("[[ERROR]]{}", msg);
                emit_stream_error(&window, &err_reply);
                log::error!("call_bot_stream: Error starting stream: {}", &err_reply);
            }
        }
    });
    let abort_handle = task_handle.abort_handle();
    // Bind listener for cancel events
    let event_handle = window_clone.listen("stop-bot", move |_| {
        log::info!("Bot call stopped!");
        abort_handle.abort();
        emit_stream_stopped(&window_clone_2);
    });
    // Run task
    let _ = task_handle.await;
    // Unbind listener for cancel events before thread ends
    window_clone.unlisten(event_handle);
}
/***** Functions for calling model API END *****/

/***** Helper functions for emitting events to frontend START *****/
fn emit_stream_start(window: &tauri::Window) {
    match window.emit("bot-reply", "[[START]]") {
        Err(err) => {
            log::error!("Error when sending event: {}", err);
            // simple retry
            let _ = window.emit("bot-reply", "[[START]]");
        },
        _ => {}
    }
}

fn emit_stream_done(window: &tauri::Window) {
    match window.emit("bot-reply", "[[DONE]]") {
        Err(err) => {
            log::error!("Error when sending event: {}", err);
            // simple retry
            let _ = window.emit("bot-reply", "[[DONE]]");
        },
        _ => {}
    }
}

fn emit_stream_stopped(window: &tauri::Window) {
    match window.emit("bot-reply", "[[STOPPED]]") {
        Err(err) => {
            log::error!("Error when sending event: {}", err);
            // simple retry
            let _ = window.emit("bot-reply", "[[STOPPED]]");
        },
        _ => {}
    }
}

fn emit_stream_error(window: &tauri::Window, err_message: &String) {
    match window.emit("bot-reply", err_message) {
        Err(err) => {
            log::error!("Error when sending event: {}", err);
            // retry
            let _ = window.emit("bot-reply", err_message);
        },
        _ => {}
    }
}

fn emit_stream_data(window: &tauri::Window, data: String) {
    let _ = window.emit("bot-reply", data);
}
/***** Helper functions for emitting events to frontend END *****/