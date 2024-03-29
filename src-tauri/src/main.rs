// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod core;
mod errors;
mod init;
mod services;

use chrono::Local;
use log::LevelFilter;
use tauri::Manager;
use tauri_plugin_log::{fern::colors::{Color, ColoredLevelConfig}, LogTarget};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::create_model,
            commands::list_models,
            commands::list_settings,
            commands::upsert_setting,
            commands::create_conversation,
            commands::list_conversations,
            commands::get_options,
            commands::update_options,
            commands::create_message,
            commands::list_messages,
            commands::call_bot
        ])
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::Stdout, LogTarget::Webview])
                .format(move |out, message, record| {
                    out.finish(format_args!(
                        "[{}][{}][{}] {}",
                        Local::now().format("%Y-%m-%d %H:%M:%S%.3f"),
                        record.level(),
                        record.target(),
                        message
                    ))
                })
                .level(LevelFilter::Debug)
                // .with_colors(ColoredLevelConfig {
                //     error: Color::Red,
                //     warn: Color::Yellow,
                //     debug: Color::Green,
                //     info: Color::White,
                //     trace: Color::White,
                // })
                .build(),
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
