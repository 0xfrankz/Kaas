
use entity::entities::conversations::{self, ActiveModel as ActiveConversation, AzureOptions, ConversationListItem, Model as Conversation, OpenAIOptions, ProviderOptions};
use entity::entities::messages::{self, ActiveModel as ActiveMessage, Model as Message, MessageToModel, NewMessage};
use entity::entities::models::{self, Model, ProviderConfig, Providers};
use entity::entities::settings::{self, Model as Setting};
use log::{error, info};
use migration::{Migrator, MigratorTrait};
use sea_orm::ActiveValue::NotSet;
use sea_orm::{DbErr, IntoActiveModel, JoinType, QueryFilter, QueryOrder, QuerySelect};
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
use sea_orm::entity::ModelTrait;
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
     * Get a model by id
     */
    pub async fn get_model(&self, model_id: i32) -> Result<Model, String> {
        let result = models::Entity::find_by_id(model_id)
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                "Failed to get model".to_string()
            })?
            .ok_or(format!("Model with id {} doesn't exist", model_id))?;
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
    pub async fn upsert_setting(&self, setting: Setting) -> Result<Setting, String> {
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
     * Get a setting by key
     */
    pub async fn get_setting(&self, key: &str) -> Option<Setting> {
        settings::Entity::find_by_id(key)
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!("Failed to get setting with key = {}", key)
            })
            .unwrap_or(None)
    }

    /**
     * Insert a new conversation
     */
    pub async fn create_conversation(
        &self,
        conversation: Conversation,
    ) -> Result<Conversation, String> {
        let model = self.get_model(conversation.model_id).await?;
        let mut active_model: ActiveConversation = conversation.clone().into();
        active_model.id = ActiveValue::NotSet;
        match model.provider.into() {
            Providers::Azure => {
                let options_str = serde_json::to_string(&AzureOptions::default()).unwrap_or(String::default());
                active_model.options = Set(options_str);
            }
            _ => {
                active_model.options = Set(String::default());
            }
        }
        
        active_model.created_at = Set(chrono::Local::now());
        let result: Conversation = active_model.insert(&self.connection).await.map_err(|err| {
            error!("{}", err);
            "Failed to create conversation".to_owned()
        })?;
        Ok(result)
    }

    pub async fn create_conversation_with_message(&self, conversation: Conversation, message: Message) -> Result<(Conversation, Message), String> {
        let model = self
                .get_model(conversation.model_id)
                .await?;
        let result = self.connection.transaction::<_, (Conversation, Message), DbErr>(|txn| {
            Box::pin(async move {
                let mut c_am: ActiveConversation = conversation.into();
                c_am.id = ActiveValue::NotSet;
                match model.provider.into() {
                    Providers::Azure => {
                        let options_str = serde_json::to_string(&AzureOptions::default()).unwrap_or(String::default());
                        c_am.options = Set(options_str);
                    }
                    _ => {
                        let options_str = serde_json::to_string(&OpenAIOptions::default()).unwrap_or(String::default());
                        c_am.options = Set(options_str);
                    }
                }
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
     * Get model provider and requeset options of a conversation
     */
    pub async fn get_conversation_options(&self, conversation_id: i32) -> Result<ProviderOptions, String> {
        let result = conversations::Entity::find_by_id(conversation_id)
                .select_only()
                .column(conversations::Column::Options)
                .join(
                    JoinType::InnerJoin, 
                    conversations::Relation::Models.def()
                )
                .column(models::Column::Provider)
                .into_model::<ProviderOptions>()
                .one(&self.connection)
                .await
                .map_err(|err| {
                    error!("{}", err);
                    format!("Failed to get options of conversation with id = {}", conversation_id)
                })?
                .ok_or(
                    format!(
                        "Cannot retrieve options of conversation with id = {}", 
                        conversation_id
                    )
                )?;
        Ok(result)
    }

    /**
     * Get model provider and config of a conversation
     */
    pub async fn get_conversation_config(&self, conversation_id: i32) -> Result<ProviderConfig, String> {
        let result = conversations::Entity::find_by_id(conversation_id)
            .select_only()
            .join(
                JoinType::InnerJoin, 
                conversations::Relation::Models.def()
            )
            .column(models::Column::Provider)
            .column(models::Column::Config)
            .into_model::<ProviderConfig>()
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!("Failed to get model config of conversation with id = {}", conversation_id)
            })?
            .ok_or(
                format!(
                    "Cannot retrieve model config of conversation with id = {}", 
                    conversation_id
                )
            )?;
        Ok(result)
    }
    /**
     * Update options of a conversation
     */
    pub async fn update_conversation_options(&self, conversation_id: i32, options: String) -> Result<ProviderOptions, String> {
        // Get conversation model
        let conversation = conversations::Entity::find_by_id(conversation_id)
                .one(&self.connection)
                .await
                .map_err(|err| { 
                    error!("{}", err);
                    format!("Failed to find conversation with id = {}", conversation_id)
                })?
                .ok_or(
                    format!(
                        "Conversation with id {} doesn't exist", 
                        conversation_id
                    )
                )?;
        // Convert to active model
        let model_id = conversation.model_id;
        let mut c_am: conversations::ActiveModel = conversation.into();
        // Get provider string
        let provider: String = models::Entity::find_by_id(model_id)
                .select_only()
                .column(models::Column::Provider)
                .into_tuple()
                .one(&self.connection)
                .await
                .map_err(|_| format!("Failed to get provider of conversation with id = {}", conversation_id))?
                .unwrap_or(Providers::Unknown.into());
        // Validate & set options string of active model
        let options_str;
        match provider.clone().into() {
            Providers::Azure => {
                // Deserialize & serialize the options as validation
                let azure_options: AzureOptions = serde_json::from_str(&options)
                    .unwrap_or_else(|err| {
                        // record error and return default
                        error!("{}", err);
                        AzureOptions::default()
                    });
                options_str = serde_json::to_string(&azure_options).unwrap_or(String::default());
                c_am.options = Set(options_str.clone());
            }
            _ => {
                // Deserialize & serialize the options as validation
                let openai_options: OpenAIOptions = serde_json::from_str(&options)
                    .unwrap_or_else(|err| {
                        // record error and return default
                        error!("{}", err);
                        OpenAIOptions::default()
                    });
                options_str = serde_json::to_string(&openai_options).unwrap_or(String::default());
                c_am.options = Set(options_str.clone());
            }
        }
        // Update DB
        c_am.update(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!("Failed to update options of conversation with id = {}", conversation_id)
            })?;
        Ok(ProviderOptions { provider, options: options_str })
    }

    /**
     * Get the last message of a conversation
     */
    pub async fn get_last_message(&self, conversation_id: i32) -> Result<Message, String> {
        let last_message = messages::Entity::find()
            .filter(messages::Column::ConversationId.eq(conversation_id))
            .order_by_desc(messages::Column::CreatedAt)
            .one(&self.connection)
            .await
            .map_err(|err| { 
                error!("{}", err);
                format!("Failed to find last message with conversation id = {}", conversation_id)
            })?
            .ok_or(format!("Message with conversation id = {} doesn't exist", conversation_id))?;
        Ok(last_message)
    }

    /**
     * Insert a new message
     */
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
            // .unwrap();
            .map_err(|err| {
                error!("{}", err);
                format!("Failed to list messages of conversation with id = {}", conversation_id)
            })?;
        Ok(result)
    }

    pub async fn get_model_of_message(&self, message: &Message) -> Result<Model, String> {
        let result = message
            .find_linked(MessageToModel)
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!("Failed get model of message with id = {}", message.id)
            })?
            .ok_or(format!("Failed to get model of message with id = {}", message.id))?;

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
