use tauri::{App, Manager};
use tauri::api::path::app_data_dir;
use crate::core::handle::Handle;
use crate::services::db::Builder as RepoBuilder;

pub fn init(app: &App) -> Result<(), String> {
  // Init handle
  init_handle(app)?;
  // Init database
  init_db(app)?;
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
  let _app_data_dir = _app_data_dir.to_str().expect("App data path is not a valid string!").to_string();
  // Init repo
  let repo = RepoBuilder::default().set_db_url(get_sqlite_path(&_app_data_dir)).build()?;
  // Run migrations
  repo.migrate()?;
  // Manage repo as a Tauri state
  app.handle().manage(repo);
  
  Ok(())
}

// Get the path where the database file should be located.
fn get_sqlite_path(app_data_dir: &str) -> String {
  app_data_dir.to_string() + "/.kaas/database.sqlite"
}