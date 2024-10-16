use base64::{engine::general_purpose::STANDARD, Engine as _};
use infer;
use tauri::Manager;
use std::{io::Read, path::PathBuf};

use crate::core::handle::Handle;

pub fn read_as_data_url(file_name: &str, mimetype: Option<&str>) -> Result<String, String> {
    let (mime, data) = read_as_base64_with_mime(file_name, mimetype)?;
    let result = format!("data:{};base64,{}", mime, data);
    Ok(result)
}

pub fn read_as_base64_with_mime(
    file_name: &str,
    mimetype: Option<&str>,
) -> Result<(String, String), String> {
    let mut file_path = get_cache_dir()?;
    file_path.push(file_name);
    let mut data = vec![];
    std::fs::File::open(file_path)
        .map_err(|_| format!("Failed to open file {} in cache", file_name))?
        .read_to_end(&mut data)
        .map_err(|_| format!("Failed to read file {} in cache", file_name))?;
    // Infer MIME from binary data
    let mime = match mimetype {
        Some(m) => m,
        None => infer::get(&data)
            .map(|m| m.mime_type())
            .unwrap_or("application/octet-stream"),
    };
    let base64_str = STANDARD.encode(data);
    Ok((mime.to_string(), base64_str))
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
    let mut cache_dir = app_handle.path().app_data_dir().map_err(|e| format!("App data path does't exist! {}", e))?;
    cache_dir.push("cache");
    return Ok(cache_dir);
}
