
use entity::entities::conversations::{self, ConversationListItem, Model as Conversation, ActiveModel as ActiveConversation};
use entity::entities::messages::{self, ActiveModel as ActiveMessage, Model as Message, NewMessage};
use entity::entities::models::{self, Model};
use entity::entities::settings::{self, Model as Setting};
use log::{error, info};
use migration::{Migrator, MigratorTrait};
use sea_orm::{DbErr, IntoActiveModel, JoinType, QueryFilter, QuerySelect};
use sea_orm::{
    sea_query, 
    ActiveModelTrait,
    ActiveValue::{self, Set},
    Database, 
    DatabaseConnection, 
    EntityTrait, 
    ColumnTrait, 
    RelationTrait,
    TransactionTrait
};
use sqlx::migrate::MigrateDatabase;

type Db = sqlx::sqlite::Sqlite;

pub struct Repository {
    connection: DatabaseConnection,
}

impl Repository {
    pub fn migrate(&self) -> Result<(), String> {
        tauri::async_runtime::block_on(async move {
            Migrator::up(&self.connection, None)
                .await
                .map_err(|_| "Failed to migrate database!")?;
            info!("Database migrated");
            Ok(())
        })
    }

    /**
     * Insert a new model
     */
    pub async fn create_model(&self, model: Model) -> Result<Model, String> {
        let mut active_model: models::ActiveModel = model.into();
        active_model.id = ActiveValue::NotSet;
        active_model.created_at = Set(chrono::Local::now());
        let result = active_model.insert(&self.connection).await.map_err(|err| {
            error!("{}", err);
            "Failed to create model".to_string()
        })?;
        Ok(result)
    }

    /**
     * List all models
     * TODO: add filtering and ordering, eg. not deleted, sorted by create_date desc
     */
    pub async fn list_models(&self) -> Result<Vec<Model>, String> {
        let result: Vec<Model> = 
            models::Entity::find()
                .all(&self.connection)
                .await.map_err(|err| {
                    error!("{}", err);
                    "Failed to list models".to_string()
                })?;
        Ok(result)
    }

    /**
     * List all settings
     */
    pub async fn list_settings(&self) -> Result<Vec<settings::Model>, String> {
        let result = 
            settings::Entity::find()
                .all(&self.connection)
                .await
                .map_err(|err| {
                    error!("{}", err);
                    "Failed to list settings".to_string()
                })?;
        Ok(result)
    }

    /**
     * Update a setting, insert if it doesn't exist
     */
    pub async fn upsert_settings(&self, setting: Setting) -> Result<Setting, String> {
        let active_model: settings::ActiveModel = setting.clone().into();
        let _ = settings::Entity::insert(active_model)
            .on_conflict(
                sea_query::OnConflict::column(settings::Column::Key)
                    .update_column(settings::Column::Value)
                    .to_owned(),
            )
            .exec(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                "Failed to upsert setting".to_string()
            })?;
        Ok(setting)
    }

    /**
     * Insert a new conversation
     */
    #[allow(dead_code)]
    pub async fn create_conversation(
        &self,
        conversation: Conversation,
    ) -> Result<Conversation, String> {
        let mut active_model: ActiveConversation = conversation.clone().into();
        active_model.id = ActiveValue::NotSet;
        // TODO: options should be set to default values of current model
        active_model.options = Set("".to_owned());
        active_model.created_at = Set(chrono::Local::now());
        let result: Conversation = active_model.insert(&self.connection).await.map_err(|err| {
            error!("{}", err);
            "Failed to create conversation".to_owned()
        })?;
        Ok(result)
    }

    pub async fn create_conversation_with_message(&self, conversation: Conversation, message: Message) -> Result<(Conversation, Message), String> {
        let result = self.connection.transaction::<_, (Conversation, Message), DbErr>(|txn| {
            Box::pin(async move {
                let mut c_am: ActiveConversation = conversation.into();
                c_am.id = ActiveValue::NotSet;
                c_am.options = Set("".to_owned());
                c_am.created_at = Set(chrono::Local::now());

                let c_m: Conversation = c_am
                    .insert(txn)
                    .await?;
                
                let mut m_am: ActiveMessage = message.into();
                m_am.id = ActiveValue::NotSet;
                m_am.conversation_id = Set(c_m.id);
                m_am.created_at = Set(chrono::Local::now());

                let m_m: Message = m_am
                    .insert(txn)
                    .await?;
                
                Ok((c_m, m_m))
            })
        })
        .await
        .map_err(|err| {
            error!("Failed to create conversation with message: {}", err);
            err.to_string()
        })?;
        Ok(result)
    }

    /**
     * List all conversations
     */
    pub async fn list_conversations(&self) -> Result<Vec<ConversationListItem>, String> {
        let result = conversations::Entity::find()
                .join(
                    JoinType::LeftJoin,
                    conversations::Relation::Messages.def()
                )
                .join(
                    JoinType::InnerJoin,
                    conversations::Relation::Models.def()
                )
                .column_as(models::Column::Provider, "model_provider")
                .column_as(messages::Column::Id.count(), "message_count")
                .group_by(conversations::Column::Id)
                .into_model::<ConversationListItem>()
                .all(&self.connection)
                .await
                .map_err(|err| {
                    error!("{}", err);
                    "Failed to list conversations".to_string()
                })?;
        Ok(result)
    }

    /**
     * Insert a new message
     */
    #[allow(dead_code)]
    pub async fn create_message(&self, new_message: NewMessage) -> Result<Message, String> {
        let mut active_model = new_message.into_active_model();
        active_model.created_at  = Set(chrono::Local::now());
        let result = active_model
            .insert(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                "Failed to create new message".to_string()
            })?;
        Ok(result)
    }

    /**
     * List all messages of a conversation
     */
    pub async fn list_messages(&self, conversation_id: i32) -> Result<Vec<Message>, String> {
        // Retrieve all Messages from DB with conversation_id
        let result= messages::Entity::find()
            .filter(messages::Column::ConversationId.eq(conversation_id))
            .all(&self.connection)
            .await
            .unwrap();
            // .map_err(|err| {
            //     error!("{}", err);
            //     format!("Failed to list messages of conversation with id = {}", conversation_id)
            // })?;
        Ok(result)
    }
}

#[derive(Default)]
pub struct Builder {
    db_url: Option<String>,
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
                Db::create_database(url)
                    .await
                    .map_err(|_| "Failed to create database".to_string())?;
            }
            // let pool = SqlitePool::connect(url).await.map_err(|_| "Failed to connect to database".to_string())?;
            let connection = Database::connect(format!("sqlite:{}", url))
                .await
                .map_err(|_| "Failed to connect to database".to_string())?;
            Ok(Repository { connection })
        })
    }
}
