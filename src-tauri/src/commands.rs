use std::time::Instant;

use entity::entities::{
    conversations::{ConversationDTO, ConversationDetailsDTO, Model as Conversation, NewConversationDTO, ProviderOptions, UpdateConversationDTO, DEFAULT_CONTEXT_LENGTH, DEFAULT_MAX_TOKENS}, 
    messages::{self, ContentItem, ContentItemList, Model as Message, NewMessage, Roles}, 
    models::{Model, NewModel, ProviderConfig}, 
    prompts::{Model as Prompt, NewPrompt}, 
    settings::{Model as Setting, ProxySetting, SETTING_MODELS_CONTEXT_LENGTH, SETTING_MODELS_MAX_TOKENS, SETTING_NETWORK_PROXY}
};

use tauri::State;
use tokio_stream::StreamExt;

use crate::{
    errors::CommandError::{self, ApiError, DbError, StateError}, log_utils::{error, trace, info}, services::{db::Repository, llm::{utils, webservices as ws}}
};

type CommandResult<T = ()> = Result<T, CommandError>;

#[tauri::command]
pub async fn create_model(new_model: NewModel, repo: State<'_, Repository>) -> CommandResult<Model> {
    log::debug!("Creating model: {:?}", new_model);
    let result = repo
        .create_model(new_model)
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
pub async fn update_model(model: Model, repo: State<'_, Repository>) -> CommandResult<Model> {
    let result = repo
        .update_model(model)
        .await
        .map_err(|message| DbError { message })?;
    Ok(result)
}

#[tauri::command]
pub async fn delete_model(model_id: i32, repo: State<'_, Repository>) -> CommandResult<Model> {
    let now = Instant::now();
    let result = repo
        .delete_model(model_id)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::delete_model]: {:.2?}", elapsed);
    Ok(result)
}

#[tauri::command]
pub async fn list_remote_models(provider: String, api_key: String, repo: State<'_, Repository>) -> CommandResult<Vec<async_openai::types::Model>> {
    let now = Instant::now();
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
    let result = ws::list_models(provider, api_key, proxy_setting)
        .await
        .map_err(|message| ApiError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::list_remote_models]: {:.2?}", elapsed);
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
    new_conversation: NewConversationDTO,
    repo: State<'_, Repository>,
) -> CommandResult<Conversation> {
    // Assemble conversation & message models
    let conversation = Conversation {
        model_id: Some(new_conversation.model_id),
        subject: new_conversation.message.clone(),
        ..Default::default()
    };
    let message = Message {
        role: messages::Roles::from(0).into(), // first messge must be User message
        content: ContentItemList::new(ContentItem::text(new_conversation.message)),
        ..Default::default()
    };
    let (conversation, _) = repo
        .create_conversation_with_message(conversation, message)
        .await
        .map_err(|message| DbError { message })?;

    Ok(conversation)
}

#[tauri::command]
pub async fn create_blank_conversation(blank_conversation: Conversation, repo: State<'_, Repository>) -> CommandResult<Conversation> {
    let conversation = repo
        .create_conversation(blank_conversation)
        .await
        .map_err(|message| DbError { message })?;

    Ok(conversation)
}

#[tauri::command]
pub async fn list_conversations(repo: State<'_, Repository>) -> CommandResult<Vec<ConversationDetailsDTO>> {
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
pub async fn delete_conversation(conversation_id: i32, repo: State<'_, Repository>) -> CommandResult<ConversationDTO> {
    let now = Instant::now();
    let result = repo
        .delete_conversation(conversation_id)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::delete_conversation]: {:.2?}", elapsed);
    Ok(result)
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

#[tauri::command]
pub async fn update_conversation_model(conversation_id: i32, model_id: i32, repo: State<'_, Repository>) -> CommandResult<ConversationDetailsDTO> {
    let now = Instant::now();
    let result = repo
        .update_conversation_model(conversation_id, model_id)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::update_conversation_model]: {:.2?}", elapsed);
    Ok(result)
}

#[tauri::command]
pub async fn update_conversation(conversation: UpdateConversationDTO, repo: State<'_, Repository>) -> CommandResult<ConversationDetailsDTO> {
    let now = Instant::now();
    let result = repo
        .update_conversation(conversation)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::update_conversation]: {:.2?}", elapsed);
    Ok(result)
}

#[tauri::command]
pub async fn create_message(message: NewMessage, repo: State<'_, Repository>) -> CommandResult<Message> {
    let now = Instant::now();
    log::info!("create_message: message = {:?}", message);
    let result = repo
        .create_message(message)
        .await
        .map_err(|message| DbError { message })?;
    log::info!("create_message: result = {:?}", result);
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
pub async fn get_system_message(conversation_id: i32, repo: State<'_, Repository>) -> CommandResult<Option<Message>> {
    let now = Instant::now();
    let result = repo
        .get_system_message(conversation_id)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::get_system_message]: {:.2?}", elapsed);
    Ok(result)
}

#[tauri::command]
pub async fn update_message(message: Message, repo: State<'_, Repository>) -> CommandResult<Message> {
    let now = Instant::now();
    let result = repo
        .update_message(message)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::update_message]: {:.2?}", elapsed);
    Ok(result)
}

#[tauri::command]
pub async fn hard_delete_message(message: Message, repo: State<'_, Repository>) -> CommandResult<Message> {
    let now = Instant::now();
    let result = repo
        .hard_delete_message(message)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::hard_delete_message]: {:.2?}", elapsed);
    Ok(result)
}

#[tauri::command]
pub async fn call_bot(conversation_id: i32, tag: String, before_message_id: Option<i32>, window: tauri::Window, repo: State<'_, Repository>) -> CommandResult<()> {
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
    // Retrieve system message
    let sys_message = repo
        .get_system_message(conversation_id)
        .await
        .map_err(|message| DbError { message })?;
    // Retrieve message list as context
    let mut context = repo
        .get_last_messages(conversation_id, context_length + 1, before_message_id) // plus one to get the last user's message
        .await
        .map_err(|message| DbError { message })?;
    if let Some(sys_m) = sys_message {
        context.insert(0, sys_m);
    }
    log::info!("bot calling context: {:?}", context);
    // delegate to one-off or stream function to send request
    let is_stream_enabled = utils::is_stream_enabled(&options);
    if is_stream_enabled {
        // stream response
        call_bot_stream(tag, window, context, options, config, proxy_setting, max_token_setting).await;
    } else {
        // one-off response
        call_bot_one_off(tag, window, context, options, config, proxy_setting, max_token_setting).await;
    }
    let elapsed = now.elapsed();
    log::info!("[Timer][commands::call_bot]: {:.2?}", elapsed);
    Ok(())
}

#[tauri::command]
pub async fn create_prompt(new_prompt: NewPrompt, repo: State<'_, Repository>) -> CommandResult<Prompt> {
    let log_tag = "create_prompt";
    let now = Instant::now();
    info(log_tag, &format!("{:?}", new_prompt));
    let result = repo
        .create_prompt(new_prompt)
        .await
        .map_err(|message| DbError { message })?;
    let elapsed = now.elapsed();
    info(log_tag, &format!("[Timer]: {:.2?}", elapsed));
    Ok(result)
}

#[tauri::command]
pub async fn list_prompts(repo: State<'_, Repository>) -> CommandResult<Vec<Prompt>> {
    let result = repo
        .list_prompts()
        .await
        .map_err(|message| DbError { message })?;
    Ok(result)
}

#[tauri::command]
pub async fn update_prompt(prompt: Prompt, repo: State<'_, Repository>) -> CommandResult<Prompt> {
    let result = repo
        .update_prompt(prompt)
        .await
        .map_err(|message| DbError { message })?;
    Ok(result)
}

#[tauri::command]
pub async fn delete_prompt(prompt_id: i32, repo: State<'_, Repository>) -> CommandResult<Prompt> {
    let result = repo
        .delete_prompt(prompt_id)
        .await
        .map_err(|message| DbError { message })?;
    Ok(result)
}

/***** Functions for calling model API START *****/
async fn call_bot_one_off(tag: String, window: tauri::Window, messages: Vec<Message>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, max_token_setting: u16) {
    log::info!("call_bot_one_off");
    let window_clone = window.clone();
    let window_clone_2 = window.clone();
    let tag_clone = tag.clone();
    let task_handle = tokio::spawn(async move {
        // handle non-stream response
        log::info!("call_bot_one_off: thread start");
        let result = ws::complete_chat(messages, options, config, proxy_setting, Some(max_token_setting))
            .await;
        match result {
            Ok(reply) => {
                // start receiving in frontend
                emit_stream_start(&tag, &window);
                log::info!("Bot call received: {}", reply);
                emit_stream_data(&tag, &window, reply);
                emit_stream_done(&tag, &window);
                log::info!("call_bot_one_off: thread done");
            },
            Err(msg) => {
                let err_reply = format!("[[ERROR]]{}", msg);
                emit_stream_error(&tag, &window, &err_reply);
                log::error!("call_bot_one_off: {}", &err_reply);
            }
        }
    });
    let abort_handle = task_handle.abort_handle();
    // Bind listener for cancel events
    let event_handle = window_clone.listen("stop-bot", move |_| {
        log::info!("Bot call stopped!");
        abort_handle.abort();
        emit_stream_stopped(&tag_clone, &window_clone_2);
    });
    // Run task
    let _ = task_handle.await;
    // Unbind listener for cancel events before thread ends
    window_clone.unlisten(event_handle);

}

async fn call_bot_stream(tag: String, window: tauri::Window, messages: Vec<Message>, options: ProviderOptions, config: ProviderConfig, proxy_setting: Option<ProxySetting>, max_token_setting: u16) {
    let log_tag = "call_bot_stream";
    trace(log_tag, "entrant");
    let window_clone = window.clone();
    let window_clone_2 = window.clone();
    let tag_clone = tag.clone();
    let task_handle = tokio::spawn(async move {
        // handle stream response
        trace(log_tag, "Thread spawned");
        let stream_result = ws::complete_chat_stream(messages, options, config, proxy_setting, Some(max_token_setting)).await;
        match stream_result {
            Ok(mut stream) => {
                // start receiving in frontend
                emit_stream_start(&tag, &window);
                trace(log_tag, "Streaming started!");
                while let Some(result) = stream.next().await {
                    trace(log_tag, "Streaming data...");
                    match result {
                        Ok(response) => {
                            response.choices.iter().for_each(|chat_choice| {
                                if let Some(ref content) = chat_choice.delta.content {
                                    emit_stream_data(&tag, &window, content.to_owned());
                                }
                            });
                        }
                        Err(err) => {
                            let err_reply = format!("[[ERROR]]{}", err);
                            emit_stream_error(&tag, &window, &err_reply);
                            log::error!("Error during stream: {:?}", err);
                            error(log_tag, &format!("Error during stream: {}", &err_reply));
                            break;
                        }
                    }
                }
                trace(log_tag, "Streaming finished!");
                // stop receiving in frontend
                emit_stream_done(&tag, &window);
            },
            Err(msg) => {
                let err_reply = format!("[[ERROR]]{}", msg);
                emit_stream_error(&tag, &window, &err_reply);
                error(log_tag, &format!("Error starting stream: {}", &err_reply));
            }
        }
    });
    let abort_handle = task_handle.abort_handle();
    // Bind listener for cancel events
    let event_handle = window_clone.listen("stop-bot", move |_| {
        trace(log_tag, "call stopped");
        abort_handle.abort();
        emit_stream_stopped(&tag_clone, &window_clone_2);
    });
    // Run task
    let _ = task_handle.await;
    // Unbind listener for cancel events before thread ends
    window_clone.unlisten(event_handle);
    trace(log_tag, "exit");
}
/***** Functions for calling model API END *****/

/***** Helper functions for emitting events to frontend START *****/
fn emit_stream_start(tag: &str, window: &tauri::Window) {
    log::info!("emit_stream_start: {}", tag);
    match window.emit(tag, "[[START]]") {
        Err(err) => {
            log::error!("Error when sending event: {}", err);
            // simple retry
            let _ = window.emit(tag, "[[START]]");
        },
        _ => {}
    }
}

fn emit_stream_done(tag: &str, window: &tauri::Window) {
    match window.emit(tag, "[[DONE]]") {
        Err(err) => {
            log::error!("Error when sending event: {}", err);
            // simple retry
            let _ = window.emit(tag, "[[DONE]]");
        },
        _ => {}
    }
}

fn emit_stream_stopped(tag: &str, window: &tauri::Window) {
    match window.emit(tag, "[[STOPPED]]") {
        Err(err) => {
            log::error!("Error when sending event: {}", err);
            // simple retry
            let _ = window.emit(tag, "[[STOPPED]]");
        },
        _ => {}
    }
}

fn emit_stream_error(tag: &str, window: &tauri::Window, err_message: &String) {
    match window.emit(tag, err_message) {
        Err(err) => {
            log::error!("Error when sending event: {}", err);
            // retry
            let _ = window.emit(tag, err_message);
        },
        _ => {}
    }
}

fn emit_stream_data(tag: &str, window: &tauri::Window, data: String) {
    let _ = window.emit(tag, data);
}
/***** Helper functions for emitting events to frontend END *****/