use std::fs;

use tauri::{App, Manager};
use tauri::api::path::app_data_dir;
use crate::core::handle::Handle;
use crate::services::db::Builder as RepoBuilder;

pub fn init(app: &App) -> Result<(), String> {
  // Init handle
  init_handle(app)?;
  // Init database
  init_db(app)?;
  // Init cache dir
  init_cache_dir(app)?;
  Ok(())
}

// Initialize the wrapper of app handle
fn init_handle(app: &App) -> Result<(), String> {
  Handle::global().init(app.handle());
  Ok(())
}

// Initialize the database repository & migrate
fn init_db(app: &App) -> Result<(), String> {
  // get app data path
  let _app_data_dir = app_data_dir(&*app.config()).expect("App data path does't exist!");
  let app_data_dir_str = _app_data_dir.to_str().expect("App data path is not a valid string!").to_string();
  log::info!("App data path exists: {}, is_dir: {}", _app_data_dir.exists(), _app_data_dir.is_dir());
  if !_app_data_dir.exists() {
    if let Ok(()) = fs::create_dir(_app_data_dir) {
      log::info!("App data directory created at {}", &app_data_dir_str);
    } else {
      log::error!("Failed to create app data directory at {}", &app_data_dir_str);
      panic!("Failed to create app data directory");
    }
  }
  
  log::info!("App data path: {}", &app_data_dir_str);
  // Init repo
  let repo = RepoBuilder::default().set_db_url(get_sqlite_path(&app_data_dir_str)).build()?;
  // Run migrations
  repo.migrate()?;
  // Manage repo as a Tauri state
  app.handle().manage(repo);
  
  Ok(())
}

// Initialize the cache dir for files such as images, pdfs, etc.
fn init_cache_dir(app: &App) -> Result<(), String> {
  // get app data path
  let mut cache_dir = app_data_dir(&*app.config()).expect("App data path does't exist!");
  cache_dir.push("cache");
  let cache_dir_str = cache_dir.to_str().expect("Cache path is not a valid string!").to_string();
  
  if !cache_dir.exists() {
    if let Ok(()) = fs::create_dir(cache_dir) {
      log::info!("Cache directory created at {}", &cache_dir_str);
    } else {
      log::error!("Failed to create cache directory at {}", &cache_dir_str);
      panic!("Failed to create cache directory");
    }
  } else {
    log::info!("Cache directory {} already exists", &cache_dir_str);
  }

  Ok(())
}

// Get the path where the database file should be located.
fn get_sqlite_path(app_data_dir: &str) -> String {
  app_data_dir.to_string() + "/database.sqlite"
}