use std::{io::Read, path::PathBuf};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use tauri::api::path::app_data_dir;
use infer;

use crate::core::handle::Handle;

pub fn read_as_base64(file_name: &str) -> Result<String, String> {
    let mut file_path = get_cache_dir()?;
    file_path.push(file_name);
    let mut data = vec![];
    std::fs::File::open(file_path)
        .map_err(|_| format!("Failed to open file {} in cache", file_name))?
        .read_to_end(&mut data)
        .map_err(|_| format!("Failed to read file {} in cache", file_name))?;
    let mime = infer::get(&data)
        .map(|t| t.mime_type())
        .unwrap_or("");
    let result = format!("data:{};base64,{}", mime, STANDARD.encode(data));
    Ok(result)
}

pub fn get_cache_dir() -> Result<PathBuf, String> {
    // get stored app handle
    let app_handle = Handle::global()
        .app_handle
        .lock()
        .expect("Failed to lock app handle mutex")
        .clone()
        .expect("App handle is not initialized");
    // get app data path
    let mut cache_dir = app_data_dir(&app_handle.config())
        .ok_or("App data path does't exist!")?;
    cache_dir.push("cache");
    return Ok(cache_dir);
}