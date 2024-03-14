// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod core;
mod commands;
mod services;
mod init;
mod errors;

use log::LevelFilter;
use tauri::Manager;
use tauri_plugin_log::LogTarget;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      commands::complete_chat_cmd,
      commands::create_model,
      commands::list_models,
      commands::list_settings,
      commands::upsert_setting,
      commands::create_conversation,
      commands::list_conversations,
      commands::create_message,
      commands::list_messages
    ])
    .plugin(tauri_plugin_log::Builder::default().targets([
        LogTarget::Stdout,
        LogTarget::Webview,
      ])
      .level(LevelFilter::Debug)
      .build()
    )
    .setup(|app| {
      // Open dev tools in debug builds
      #[cfg(debug_assertions)]
      {
          let window = app.get_window("main").unwrap();
          window.open_devtools();
      }
      // Initialization
      init::init(app).expect("Failed to initialize app");
      
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
