use sea_orm::{sea_query, ActiveModelTrait, ActiveValue, Database, DatabaseConnection, EntityTrait};
use migration::{Migrator, MigratorTrait};
use log::{error, info};
use sqlx::migrate::MigrateDatabase;
use entity::entities::models::{ Model, ActiveModel, Entity};
use entity::entities::settings::{self, Model as Setting};

type Db = sqlx::sqlite::Sqlite;

pub struct Repository {
  connection: DatabaseConnection,
}

impl Repository {
  pub fn migrate(&self) -> Result<(), String> {
    tauri::async_runtime::block_on(async move {
      Migrator::up(&self.connection, None).await.map_err(|_| "Failed to migrate database!")?;
      info!("Database migrated");
      Ok(())
    })
  }

  /**
   * Insert a new model
   */
  pub async fn create_model(&self, model: Model) -> Result<Model, String> {
    let mut active_model: ActiveModel = model.into();
    active_model.id = ActiveValue::NotSet;
    let result = active_model.insert(&self.connection)
      .await
      .map_err(|err| {
        error!("{}", err);
        "Failed to insert model".to_string()
      })?;
    Ok(result)
  }

  /**
   * List all models
   * TODO: add filtering and ordering, eg. not deleted, sorted by create_date desc
   */
  pub async fn list_models(&self) -> Result<Vec<Model>, String> {
    let result: Vec<Model> = Entity::find()
      .all(&self.connection)
      .await
      .map_err(|err| {
        error!("{}", err);
        "Failed to list models".to_string()
      })?;
    Ok(result)
  }

  /**
   * List all settings
   */
  pub async fn list_settings(&self) -> Result<Vec<settings::Model>, String> {
    let result = settings::Entity::find()
        .all(&self.connection)
        .await
        .map_err(|err| {
          error!("{}", err);
          "Failed to list settings".to_string()
        })?;
    Ok(result)
  }

  pub async fn upsert_settings(&self, setting: Setting) -> Result<Setting, String> {
    let active_model: settings::ActiveModel = setting.clone().into();
    let _ = settings::Entity::insert(active_model)
      .on_conflict(
        sea_query::OnConflict::column(settings::Column::Key)
          .update_column(settings::Column::Value)
          .to_owned()
      )
      .exec(&self.connection)
      .await
      .map_err(|err| {
        error!("{}", err);
        "Failed to upsert setting".to_string()
      })?;
    Ok(setting)
  }
}

#[derive(Default)]
pub struct Builder {
  db_url: Option<String>
}

impl Builder {
  pub fn set_db_url(mut self, db_url: String) -> Self {
    self.db_url = Some(db_url);
    self
  }

  pub fn build(mut self) -> Result<Repository, String> {
    tauri::async_runtime::block_on(async move {
      let url = self.db_url.as_mut().ok_or("DB url is not set")?;
      if !Db::database_exists(url).await.unwrap_or(false) {
        Db::create_database(url).await.map_err(|_| "Failed to create database".to_string())?;
      }
      // let pool = SqlitePool::connect(url).await.map_err(|_| "Failed to connect to database".to_string())?;
      let connection = Database::connect(format!("sqlite:{}", url)).await.map_err(|_| "Failed to connect to database".to_string())?;
      Ok(Repository{connection})
    })
  }
}