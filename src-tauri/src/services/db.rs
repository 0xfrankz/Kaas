use entity::entities::contents::{self, ActiveModel as ActiveContent, Model as Content};
use entity::entities::conversations::{
    self, ActiveModel as ActiveConversation, AzureOptions, ClaudeOptions, ConversationDTO,
    ConversationDetailsDTO, GenericOptions, Model as Conversation, OllamaOptions, OpenAIOptions,
    UpdateConversationDTO,
};
use entity::entities::messages::{
    self, ActiveModel as ActiveMessage, MessageDTO, MessageToModel, Model as Message,
};
use entity::entities::models::{self, GenericConfig, Model, NewModel, Providers};
use entity::entities::prompts::{self, Model as Prompt, NewPrompt};
use entity::entities::settings::{self, Model as Setting};
use log::{error, info};
use migration::{Migrator, MigratorTrait};
use sea_orm::entity::ModelTrait;
use sea_orm::{
    sea_query, ActiveModelTrait,
    ActiveValue::{self, Set},
    ColumnTrait, Database, DatabaseConnection, EntityTrait, RelationTrait, TransactionTrait,
};
use sea_orm::{
    DbErr, IntoActiveModel, JoinType, LoaderTrait, Order, QueryFilter, QueryOrder, QuerySelect,
};
use sqlx::migrate::MigrateDatabase;

type Db = sqlx::sqlite::Sqlite;

pub struct Repository {
    connection: DatabaseConnection,
}

impl Repository {
    pub fn migrate(&self) -> Result<(), String> {
        tauri::async_runtime::block_on(async move {
            Migrator::up(&self.connection, None).await.map_err(|err| {
                error!("Failed to migrate database: {:?}", err);
                format!("Failed to migrate database! Reason: {}", err)
            })?;
            info!("Database migrated");
            Ok(())
        })
    }

    /**
     * Insert a new model
     */
    pub async fn create_model(&self, new_model: NewModel) -> Result<Model, String> {
        let mut active_model = new_model.into_active_model();
        active_model.created_at = Set(Some(chrono::Local::now()));
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
        let result: Vec<Model> = models::Entity::find()
            .filter(models::Column::DeletedAt.is_null())
            .all(&self.connection)
            .await
            .map_err(|err| {
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
                format!("Failed to get model with id {}", model_id)
            })?
            .ok_or(format!("Model with id {} doesn't exist", model_id))?;
        Ok(result)
    }

    /**
     * Update a model
     */
    pub async fn update_model(&self, model: Model) -> Result<Model, String> {
        let mut active_model: models::ActiveModel = model.into();
        active_model.reset(models::Column::Alias); // mark alias as dirty
        active_model.reset(models::Column::Config); // mark config as dirty
        active_model.updated_at = Set(Some(chrono::Local::now()));
        let result = active_model.update(&self.connection).await.map_err(|err| {
            error!("{}", err);
            "Failed to update model".to_string()
        })?;
        Ok(result)
    }

    /**
     * Soft delete a model
     */
    pub async fn delete_model(&self, model_id: i32) -> Result<Model, String> {
        let model = models::Entity::find_by_id(model_id)
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!("Failed to get model with id {}", model_id)
            })?
            .ok_or(format!("Model with id {} doesn't exist", model_id))?;
        let mut active_model: models::ActiveModel = model.into();
        // Perform soft delete
        active_model.deleted_at = Set(Some(chrono::Local::now()));
        let result = active_model.update(&self.connection).await.map_err(|err| {
            error!("{}", err);
            "Failed to delete model".to_string()
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
        let mut active_model: ActiveConversation = conversation.clone().into();
        active_model.id = ActiveValue::NotSet;
        if let Some(model_id) = conversation.model_id {
            let model = self.get_model(model_id).await?;
            match model.provider.into() {
                Providers::Azure => {
                    let options_str = serde_json::to_string(&AzureOptions::default())
                        .unwrap_or(String::default());
                    active_model.options = Set(Some(options_str));
                }
                Providers::Claude => {
                    let options_str = serde_json::to_string(&ClaudeOptions::default())
                        .unwrap_or(String::default());
                    active_model.options = Set(Some(options_str));
                }
                Providers::Ollama => {
                    let options_str = serde_json::to_string(&OllamaOptions::default())
                        .unwrap_or(String::default());
                    active_model.options = Set(Some(options_str));
                }
                _ => {
                    let options_str = serde_json::to_string(&OpenAIOptions::default())
                        .unwrap_or(String::default());
                    active_model.options = Set(Some(options_str));
                }
            }
        }

        active_model.created_at = Set(chrono::Local::now());
        // Set last message at to created at, so new conversation is shown at the top of the list
        active_model.last_message_at = Set(Some(chrono::Local::now()));
        let result: Conversation = active_model.insert(&self.connection).await.map_err(|err| {
            error!("{}", err);
            "Failed to create conversation".to_owned()
        })?;
        Ok(result)
    }

    pub async fn create_conversation_with_content(
        &self,
        conversation: Conversation,
        content: Content,
    ) -> Result<(Conversation, Message, Content), String> {
        // when created with a message
        // model id must be present
        let mode_id = conversation
            .model_id
            .ok_or("Model id is missing".to_owned())?;
        let model = self.get_model(mode_id).await?;
        let result = self
            .connection
            .transaction::<_, (Conversation, Message, Content), DbErr>(|txn| {
                Box::pin(async move {
                    let mut conv_am: ActiveConversation = conversation.into();
                    conv_am.id = ActiveValue::NotSet;
                    match model.provider.into() {
                        Providers::Azure => {
                            let options_str = serde_json::to_string(&AzureOptions::default())
                                .unwrap_or(String::default());
                            conv_am.options = Set(Some(options_str));
                        }
                        Providers::Claude => {
                            let options_str = serde_json::to_string(&ClaudeOptions::default())
                                .unwrap_or(String::default());
                            conv_am.options = Set(Some(options_str));
                        }
                        Providers::Ollama => {
                            let options_str = serde_json::to_string(&OllamaOptions::default())
                                .unwrap_or(String::default());
                            conv_am.options = Set(Some(options_str));
                        }
                        _ => {
                            let options_str = serde_json::to_string(&OpenAIOptions::default())
                                .unwrap_or(String::default());
                            conv_am.options = Set(Some(options_str));
                        }
                    }
                    conv_am.created_at = Set(chrono::Local::now());
                    // Set last message at to created at, so new conversation is shown at the top of the list
                    conv_am.last_message_at = Set(Some(chrono::Local::now()));

                    let conv_m: Conversation = conv_am.insert(txn).await?;

                    let msg_m: Message = ActiveMessage {
                        conversation_id: Set(conv_m.id),
                        created_at: Set(chrono::Local::now()),
                        role: Set(messages::Roles::User.into()),
                        ..Default::default()
                    }
                    .insert(txn)
                    .await?;

                    let mut ctnt_am: ActiveContent = content.into();
                    ctnt_am.id = ActiveValue::NotSet;
                    ctnt_am.message_id = Set(msg_m.id);
                    let ctnt_m = ctnt_am.insert(txn).await?;

                    Ok((conv_m, msg_m, ctnt_m))
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
    pub async fn list_conversations(&self) -> Result<Vec<ConversationDetailsDTO>, String> {
        let result = conversations::Entity::find()
            .filter(conversations::Column::DeletedAt.is_null())
            .join(JoinType::LeftJoin, conversations::Relation::Messages.def())
            .join(JoinType::LeftJoin, conversations::Relation::Models.def())
            .column_as(models::Column::Provider, "model_provider")
            .column_as(messages::Column::Id.count(), "message_count")
            .group_by(conversations::Column::Id)
            .order_by(conversations::Column::LastMessageAt, Order::Desc)
            .order_by(conversations::Column::CreatedAt, Order::Desc)
            .into_model::<ConversationDetailsDTO>()
            .all(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                "Failed to list conversations".to_string()
            })?;
        Ok(result)
    }

    /**
     * Soft delete a conversation
     */
    pub async fn delete_conversation(
        &self,
        conversation_id: i32,
    ) -> Result<ConversationDTO, String> {
        let conv = conversations::Entity::find_by_id(conversation_id)
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!("Failed to get conversation with id = {}", conversation_id)
            })?
            .ok_or(format!(
                "Conversation with id {} doesn't exist",
                conversation_id
            ))?;
        let mut active_model: conversations::ActiveModel = conv.into();
        // Perform soft delete
        active_model.deleted_at = Set(Some(chrono::Local::now()));
        let result = active_model.update(&self.connection).await.map_err(|err| {
            error!("{}", err);
            format!(
                "Failed to delete conversation with id = {}",
                conversation_id
            )
        })?;
        Ok(result)
    }

    /**
     * Get model provider and requeset options of a conversation
     */
    pub async fn get_conversation_options(
        &self,
        conversation_id: i32,
    ) -> Result<GenericOptions, String> {
        let result = conversations::Entity::find_by_id(conversation_id)
            .select_only()
            .column(conversations::Column::Options)
            .join(JoinType::InnerJoin, conversations::Relation::Models.def())
            .column(models::Column::Provider)
            .into_model::<GenericOptions>()
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!(
                    "Failed to get options of conversation with id = {}",
                    conversation_id
                )
            })?
            .ok_or(format!(
                "Cannot retrieve options of conversation with id = {}",
                conversation_id
            ))?;
        Ok(result)
    }

    /**
     * Get model provider and config of a conversation
     */
    pub async fn get_conversation_config(
        &self,
        conversation_id: i32,
    ) -> Result<GenericConfig, String> {
        let result = conversations::Entity::find_by_id(conversation_id)
            .select_only()
            .join(JoinType::InnerJoin, conversations::Relation::Models.def())
            .column(models::Column::Provider)
            .column(models::Column::Config)
            .into_model::<GenericConfig>()
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!(
                    "Failed to get model config of conversation with id = {}",
                    conversation_id
                )
            })?
            .ok_or(format!(
                "Cannot retrieve model config of conversation with id = {}",
                conversation_id
            ))?;
        Ok(result)
    }
    /**
     * Update options of a conversation
     */
    pub async fn update_conversation_options(
        &self,
        conversation_id: i32,
        options: String,
    ) -> Result<GenericOptions, String> {
        // Get conversation model
        let conversation = conversations::Entity::find_by_id(conversation_id)
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!("Failed to find conversation with id = {}", conversation_id)
            })?
            .ok_or(format!(
                "Conversation with id {} doesn't exist",
                conversation_id
            ))?;
        // Convert to active model
        let model_id = conversation
            .model_id
            .ok_or("Model id is missing".to_owned())?;
        let mut c_am: conversations::ActiveModel = conversation.into();
        // Get provider string
        let provider: String = models::Entity::find_by_id(model_id)
            .select_only()
            .column(models::Column::Provider)
            .into_tuple()
            .one(&self.connection)
            .await
            .map_err(|_| {
                format!(
                    "Failed to get provider of conversation with id = {}",
                    conversation_id
                )
            })?
            .unwrap_or(Providers::Unknown.into());
        // Validate & set options string of active model
        let options_str;
        match provider.clone().into() {
            Providers::Azure => {
                // Deserialize & serialize the options as validation
                let azure_options: AzureOptions = serde_json::from_str(&options)
                    .unwrap_or_else(|err| {
                        // record error and return default
                        error!("db::update_conversation_options: Error deserializing Azure options: {}", err);
                        AzureOptions::default()
                    });
                options_str = serde_json::to_string(&azure_options).unwrap_or(String::default());
                c_am.options = Set(Some(options_str.clone()));
            }
            Providers::Claude => {
                // Deserialize & serialize the options as validation
                let claude_options: ClaudeOptions = serde_json::from_str(&options)
                    .unwrap_or_else(|err| {
                        // record error and return default
                        error!("db::update_conversation_options: Error deserializing Claude options: {}", err);
                        ClaudeOptions::default()
                    });
                options_str = serde_json::to_string(&claude_options).unwrap_or(String::default());
                c_am.options = Set(Some(options_str.clone()));
            }
            Providers::Ollama => {
                // Deserialize & serialize the options as validation
                let ollama_options: OllamaOptions = serde_json::from_str(&options)
                    .unwrap_or_else(|err| {
                        // record error and return default
                        error!("db::update_conversation_options: Error deserializing Ollama options: {}", err);
                        OllamaOptions::default()
                    });
                options_str = serde_json::to_string(&ollama_options).unwrap_or(String::default());
                c_am.options = Set(Some(options_str.clone()));
            }
            _ => {
                // Deserialize & serialize the options as validation
                let openai_options: OpenAIOptions = serde_json::from_str(&options)
                    .unwrap_or_else(|err| {
                        // record error and return default
                        error!("db::update_conversation_options: Error deserializing OpenAI options: {}", err);
                        OpenAIOptions::default()
                    });
                options_str = serde_json::to_string(&openai_options).unwrap_or(String::default());
                c_am.options = Set(Some(options_str.clone()));
            }
        }
        // Update DB
        c_am.update(&self.connection).await.map_err(|err| {
            error!("{}", err);
            format!(
                "Failed to update options of conversation with id = {}",
                conversation_id
            )
        })?;
        Ok(GenericOptions {
            provider,
            options: options_str,
        })
    }

    /**
     * Update title of a conversation
     */
    pub async fn update_conversation_subject(
        &self,
        conversation_id: i32,
        subject: String,
    ) -> Result<String, String> {
        let update_result = conversations::Entity::update_many()
            .filter(conversations::Column::Id.eq(conversation_id))
            .col_expr(
                conversations::Column::Subject,
                sea_query::Expr::value(&subject),
            )
            .exec(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!(
                    "Failed to update subject of conversation with id = {}",
                    conversation_id
                )
            })?;
        if update_result.rows_affected == 0 {
            Err(format!(
                "Conversation with id {} doesn't exist",
                conversation_id
            ))
        } else {
            Ok(subject)
        }
    }

    /**
     * Update model of a conversation
     * @return String model's privider
     */
    pub async fn update_conversation_model(
        &self,
        conversation_id: i32,
        model_id: i32,
    ) -> Result<ConversationDetailsDTO, String> {
        let model = self.get_model(model_id).await?;
        let mut active_model = conversations::ActiveModel {
            id: Set(conversation_id),
            model_id: Set(Some(model_id)),
            ..Default::default()
        };
        match (&model.provider).into() {
            Providers::Azure => {
                let options_str =
                    serde_json::to_string(&AzureOptions::default()).unwrap_or(String::default());
                active_model.options = Set(Some(options_str));
            }
            Providers::Claude => {
                let options_str =
                    serde_json::to_string(&ClaudeOptions::default()).unwrap_or(String::default());
                active_model.options = Set(Some(options_str));
            }
            Providers::Ollama => {
                let options_str =
                    serde_json::to_string(&OllamaOptions::default()).unwrap_or(String::default());
                active_model.options = Set(Some(options_str));
            }
            _ => {
                let options_str =
                    serde_json::to_string(&OpenAIOptions::default()).unwrap_or(String::default());
                active_model.options = Set(Some(options_str));
            }
        }
        active_model.updated_at = Set(Some(chrono::Local::now()));
        active_model.update(&self.connection).await.map_err(|err| {
            error!("{}", err);
            "Failed to update conversation".to_string()
        })?;

        // fetch details and return
        self.get_conversation_details(conversation_id).await
    }

    /**
     * Update a conversation
     */
    pub async fn update_conversation(
        &self,
        conversation: UpdateConversationDTO,
    ) -> Result<ConversationDetailsDTO, String> {
        let conversation_id = conversation.id;
        let mut active_model = conversations::ActiveModel::from(conversation);
        active_model.updated_at = Set(Some(chrono::Local::now()));
        active_model.update(&self.connection).await.map_err(|err| {
            error!("{}", err);
            "Failed to update conversation".to_string()
        })?;
        // fetch details and return
        self.get_conversation_details(conversation_id).await
    }

    /**
     * Get details of a conversation
     */
    pub async fn get_conversation_details(
        &self,
        conversation_id: i32,
    ) -> Result<ConversationDetailsDTO, String> {
        let result = conversations::Entity::find_by_id(conversation_id)
            .join(JoinType::LeftJoin, conversations::Relation::Messages.def())
            .join(JoinType::LeftJoin, conversations::Relation::Models.def())
            .column_as(models::Column::Provider, "model_provider")
            .column_as(messages::Column::Id.count(), "message_count")
            .group_by(conversations::Column::Id)
            .into_model::<ConversationDetailsDTO>()
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                "Failed to list conversations".to_string()
            })?
            .ok_or(format!(
                "Conversation with id {} doesn't exist",
                conversation_id
            ))?;
        Ok(result)
    }

    /**
     * Get the last n messages of a conversation
     */
    pub async fn get_last_messages(
        &self,
        conversation_id: i32,
        n: u16,
        before_message_id: Option<i32>,
    ) -> Result<Vec<MessageDTO>, String> {
        let mut query =
            messages::Entity::find().filter(messages::Column::ConversationId.eq(conversation_id));
        if let Some(mid) = before_message_id {
            query = query.filter(messages::Column::Id.lt(mid));
        }
        let messages = query
            .cursor_by(messages::Column::Id)
            .last(n as u64)
            .all(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!(
                    "Failed to find last {} messages with conversation id = {}",
                    n, conversation_id
                )
            })?;
        let contents = messages
            .load_many(contents::Entity, &self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!(
                    "Failed to find contents of the last {} messages with conversation id = {}",
                    n, conversation_id
                )
            })?;
        let result: Vec<(Message, Vec<Content>)> =
            messages.into_iter().zip(contents.into_iter()).collect();
        let dtos: Vec<MessageDTO> = result.into_iter().map(|data| data.into()).collect();

        Ok(dtos)
    }

    /**
     * Insert a new message
     */
    pub async fn create_message(&self, message: MessageDTO) -> Result<MessageDTO, String> {
        let contents = message.content.clone();
        let conversation_id = message.conversation_id;
        let mut msg_am = message.into_active_model();
        msg_am.created_at = Set(chrono::Local::now());
        let result = self
            .connection
            .transaction::<_, MessageDTO, DbErr>(|txn| {
                Box::pin(async move {
                    // Insert message first
                    let msg_m = msg_am.insert(txn).await?;
                    let ctnt_ams: Vec<contents::ActiveModel> = contents
                        .into_iter()
                        .map(|content| {
                            let mut ctnt_am: contents::ActiveModel = content.into_active_model();
                            ctnt_am.message_id = Set(msg_m.id);
                            ctnt_am
                        })
                        .collect();
                    // Insert contents
                    contents::Entity::insert_many(ctnt_ams).exec(txn).await?;
                    // Retrieve newly inserted contents
                    let contents = msg_m.find_related(contents::Entity).all(txn).await?;
                    // Update conversation's last message at
                    conversations::Entity::update_many()
                        .filter(conversations::Column::Id.eq(conversation_id))
                        .col_expr(
                            conversations::Column::LastMessageAt,
                            sea_query::Expr::value(chrono::Local::now()),
                        )
                        .exec(txn)
                        .await?;
                    // Return DTO
                    let dto = MessageDTO::from((msg_m, contents));
                    Ok(dto)
                })
            })
            .await
            .map_err(|err| {
                error!("Failed to create message with contents: {}", err);
                err.to_string()
            })?;

        Ok(result)
    }

    /**
     * List all messages of a conversation
     */
    pub async fn list_messages(&self, conversation_id: i32) -> Result<Vec<MessageDTO>, String> {
        // Retrieve all Messages from DB with conversation_id
        // By default, filter out all system messages
        let result = messages::Entity::find()
            .find_with_related(contents::Entity)
            .filter(messages::Column::ConversationId.eq(conversation_id))
            .filter(messages::Column::Role.ne(Into::<i32>::into(messages::Roles::System)))
            .filter(messages::Column::DeletedAt.is_null())
            .all(&self.connection)
            .await
            // .unwrap();
            .map_err(|err| {
                error!("{}", err);
                format!(
                    "Failed to list messages of conversation with id = {}",
                    conversation_id
                )
            })?
            .into_iter()
            .map(|data| MessageDTO::from(data))
            .collect();
        Ok(result)
    }

    /**
     * Get the system message of a conversation
     */
    pub async fn get_system_message(
        &self,
        conversation_id: i32,
    ) -> Result<Option<MessageDTO>, String> {
        let mut result = messages::Entity::find()
            .find_with_related(contents::Entity)
            .filter(messages::Column::ConversationId.eq(conversation_id))
            .filter(messages::Column::Role.eq(Into::<i32>::into(messages::Roles::System)))
            .all(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!(
                    "Failed to get system message of conversation with id = {}",
                    conversation_id
                )
            })?;
        let dto = result.pop().map(|data| MessageDTO::from(data));
        Ok(dto)
    }

    /**
     * Update the system message of a conversation
     */
    pub async fn update_message(&self, message: MessageDTO) -> Result<MessageDTO, String> {
        let message_id = message.id.ok_or("Message id is missing")?;
        let contents = message.content.clone();
        let mut msg_am = message.into_active_model();
        msg_am.updated_at = Set(Some(chrono::Local::now()));
        let result = self
            .connection
            .transaction::<_, MessageDTO, DbErr>(|txn| {
                Box::pin(async move {
                    // Update messge first
                    let msg_m = msg_am.update(txn).await?;
                    // Delete old content (hard delete)
                    contents::Entity::delete_many()
                        .filter(contents::Column::MessageId.eq(msg_m.id))
                        .exec(txn)
                        .await?;
                    // Insert new content
                    let ctnt_ams: Vec<contents::ActiveModel> = contents
                        .into_iter()
                        .map(|content| {
                            let mut ctnt_am: contents::ActiveModel = content.into_active_model();
                            ctnt_am.message_id = Set(msg_m.id);
                            ctnt_am
                        })
                        .collect();
                    contents::Entity::insert_many(ctnt_ams).exec(txn).await?;
                    // Retrieve newly inserted contents
                    let contents = msg_m.find_related(contents::Entity).all(txn).await?;
                    // Return DTO
                    let dto = MessageDTO::from((msg_m, contents));
                    Ok(dto)
                })
            })
            .await
            .map_err(|err| {
                error!(
                    "Failed to update message with contents (id={}): {}",
                    message_id, err
                );
                err.to_string()
            })?;
        // let mut active_model = message.into_active_model();
        // // active_model.reset(messages::Column::Content);
        // active_model.updated_at = Set(Some(chrono::Local::now()));
        // let result = active_model
        //     .update(&self.connection)
        //     .await
        //     .map_err(|err| {
        //         error!("{}", err);
        //         "Failed to update message".to_string()
        //     })?;
        Ok(result)
    }

    /**
     * Hard delete all messages of a conversation
     */
    pub async fn hard_delete_messages(&self, conversation_id: i32) -> Result<(), String> {
        messages::Entity::delete_many()
            .filter(messages::Column::ConversationId.eq(conversation_id))
            .exec(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!(
                    "Failed to delete messages of conversation with id {}",
                    conversation_id
                )
            })?;
        Ok(())
    }

    /**
     * Hard delete a message
     */
    pub async fn hard_delete_message(&self, message: MessageDTO) -> Result<MessageDTO, String> {
        let message_id = message.id.ok_or("Message id is missing")?;
        messages::Entity::delete_by_id(message_id)
            .exec(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                "Failed to delete message".to_string()
            })?;
        Ok(message)
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
            .ok_or(format!(
                "Failed to get model of message with id = {}",
                message.id
            ))?;

        Ok(result)
    }

    /**
     * Insert a new prompt
     */
    pub async fn create_prompt(&self, new_prompt: NewPrompt) -> Result<Prompt, String> {
        let mut active_model = new_prompt.into_active_model();
        active_model.created_at = Set(chrono::Local::now());
        let result = active_model.insert(&self.connection).await.map_err(|err| {
            error!("{}", err);
            "Failed to create new prompt".to_string()
        })?;
        Ok(result)
    }

    /**
     * List all prompts
     */
    pub async fn list_prompts(&self) -> Result<Vec<Prompt>, String> {
        let result = prompts::Entity::find()
            .filter(prompts::Column::DeletedAt.is_null())
            .all(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                "Failed to list prompts".to_string()
            })?;
        Ok(result)
    }

    /**
     * Update a prompt
     */
    pub async fn update_prompt(&self, prompt: Prompt) -> Result<Prompt, String> {
        let mut active_model: prompts::ActiveModel = prompt.into();
        active_model.reset(prompts::Column::Alias); // mark alias as dirty
        active_model.reset(prompts::Column::Content); // mark content as dirty
        active_model.updated_at = Set(Some(chrono::Local::now()));
        let result = active_model.update(&self.connection).await.map_err(|err| {
            error!("{}", err);
            "Failed to update prompt".to_string()
        })?;
        Ok(result)
    }

    /**
     * Soft delete a prompt
     */
    pub async fn delete_prompt(&self, prompt_id: i32) -> Result<Prompt, String> {
        let prompt = prompts::Entity::find_by_id(prompt_id)
            .one(&self.connection)
            .await
            .map_err(|err| {
                error!("{}", err);
                format!("Failed to get prompt with id {}", prompt_id)
            })?
            .ok_or(format!("Prompt with id {} doesn't exist", prompt_id))?;
        let mut active_model: prompts::ActiveModel = prompt.clone().into();
        // Perform soft delete
        active_model.deleted_at = Set(Some(chrono::Local::now()));
        let result = active_model.update(&self.connection).await.map_err(|err| {
            error!("{}", err);
            format!("Failed to delete prompt with id = {}", prompt_id)
        })?;
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
                    .map_err(|err| format!("Failed to create database at {}: {}", url, err))?;
            }
            // let pool = SqlitePool::connect(url).await.map_err(|_| "Failed to connect to database".to_string())?;
            let connection = Database::connect(format!("sqlite:{}", url))
                .await
                .map_err(|_| "Failed to connect to database".to_string())?;
            Ok(Repository { connection })
        })
    }
}
