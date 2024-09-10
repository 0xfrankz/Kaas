//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.14

use sea_orm::{entity::prelude::*, ActiveValue::NotSet, FromQueryResult, Set};
use serde::{Deserialize, Serialize};

pub const DEFAULT_CONTEXT_LENGTH: u16 = 1;
pub const DEFAULT_MAX_TOKENS: u32 = 256;

#[derive(Clone, Default, Debug, PartialEq, DeriveEntityModel, Eq, Deserialize, Serialize)]
#[sea_orm(table_name = "conversations")]
#[serde(rename_all = "camelCase")]
pub struct Model {
    #[sea_orm(primary_key)]
    #[serde(skip_deserializing)]
    pub id: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model_id: Option<i32>,
    pub subject: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub options: Option<String>,
    #[serde(skip_deserializing)]
    pub created_at: DateTimeLocal,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub updated_at: Option<DateTimeLocal>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub deleted_at: Option<DateTimeLocal>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub last_message_at: Option<DateTimeLocal>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub parent_id: Option<i32>,
    #[serde(default)]
    pub is_multi_models: bool,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::messages::Entity")]
    Messages,
    #[sea_orm(
        belongs_to = "super::models::Entity",
        from = "Column::ModelId",
        to = "super::models::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Models,
}

impl Related<super::messages::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Messages.def()
    }
}

impl Related<super::models::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Models.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

#[derive(Clone, Debug, FromQueryResult, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ConversationDTO {
    pub id: i32,
    pub model_id: Option<i32>,
    pub subject: String,
    pub options: Option<String>,
    pub created_at: DateTimeLocal,
    pub updated_at: Option<DateTimeLocal>,
    pub last_message_at: Option<DateTimeLocal>,
    pub parent_id: Option<i32>,
    pub is_multi_models: bool,
    pub message_count: Option<i32>,
    pub model_provider: Option<String>,
}

impl From<Model> for ConversationDTO {
    fn from(c: Model) -> Self {
        Self {
            id: c.id,
            model_id: c.model_id,
            subject: c.subject,
            options: c.options,
            created_at: c.created_at,
            updated_at: c.updated_at,
            last_message_at: c.last_message_at,
            parent_id: c.parent_id,
            is_multi_models: c.is_multi_models,
            ..Default::default()
        }
    }
}

impl From<ConversationDTO> for Model {
    fn from(c: ConversationDTO) -> Self {
        Self {
            id: c.id,
            model_id: c.model_id,
            subject: c.subject,
            options: c.options,
            created_at: c.created_at,
            updated_at: c.updated_at,
            deleted_at: None,
            last_message_at: c.last_message_at,
            parent_id: c.parent_id,
            is_multi_models: c.is_multi_models,
        }
    }
}

impl From<ConversationDTO> for ActiveModel {
    fn from(value: ConversationDTO) -> Self {
        let c: Model = value.into();
        c.into()
    }
}


#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NewConversationDTO {
    pub model_id: i32,
    pub message: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateConversationDTO {
    pub id: i32,
    pub model_id: Option<i32>,
    pub subject: Option<String>,
    pub options: Option<String>,
}

impl From<UpdateConversationDTO> for ActiveModel {
    fn from(value: UpdateConversationDTO) -> Self {
        Self {
            id: Set(value.id),
            model_id: value.model_id.map_or(NotSet, |x| Set(Some(x))),
            subject: value.subject.map_or(NotSet, |x| Set(x)),
            options: value.options.map_or(NotSet, |x| Set(Some(x))),
            created_at: NotSet,
            updated_at: NotSet,
            deleted_at: NotSet,
            last_message_at: NotSet,
            parent_id: NotSet,
            is_multi_models: NotSet,
        }
    }
}

#[derive(Clone, Debug, FromQueryResult, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenericOptions {
    pub provider: String,
    pub options: String
}

pub trait Options {}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AzureOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context_length: Option<u16>,
    // pub best_of: Option<i32>, // async-openai currently doesn't support this
    // pub echo: Option<bool>, // async-openai currently doesn't support this
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f32>, // min: -2.0, max: 2.0, default: 0
    // pub function_call: Option<ChatCompletionFunctionCall>,
    // pub functions: Option<Vec<ChatCompletionFunctions>>,
    // pub logit_bias: Option<HashMap<String, serde_json::Value>>, // default: null
    // pub logprobs: Option<i32>, // Azure seems to have a different definition from OpenAI's. async-openai currently doesn't support the Azure version
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    // #[serde(skip_serializing_if = "Option::is_none")]
    // pub n: Option<u8>, // min:1, max: 128, default: 1
    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f32>, // min: -2.0, max: 2.0, default 0
    // pub response_format: Option<ChatCompletionResponseFormat>, // to be implemented
    // pub seed: Option<i64>, // not supported by Azure
    // pub stop: Option<Stop>, // to be implemented
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    // pub suffix: Option<String>, // async-openai currently doesn't support this
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>, // min: 0, max: 2, default: 1,
    // pub tools: Option<Vec<ChatCompletionTool>>,
    // pub tool_choice: Option<ChatCompletionToolChoiceOption>,
    // pub top_logprobs: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>, // min: 0, max: 1, default: 1
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<String>,
}

impl Options for AzureOptions {}

impl Default for AzureOptions{
    fn default() -> Self {
        AzureOptions {
            context_length: None,
            frequency_penalty: Some(0.0),
            max_tokens: None,
            presence_penalty: Some(0.0),
            stream: Some(false),
            temperature: Some(1.0),
            top_p: Some(1.0),
            user: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenAIOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context_length: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f32>, // min: -2.0, max: 2.0, default: 0
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    // pub n: Option<u8>, // min:1, max: 128, default: 1
    // #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f32>, // min: -2.0, max: 2.0, default 0
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>, // min: 0, max: 2, default: 1,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>, // min: 0, max: 1, default: 1
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<String>,
}

impl Options for OpenAIOptions {}

impl Default for OpenAIOptions{
    fn default() -> Self {
        OpenAIOptions {
            context_length: None,
            frequency_penalty: Some(0.0),
            max_tokens: None,
            presence_penalty: Some(0.0),
            stream: Some(false),
            temperature: Some(1.0),
            top_p: Some(1.0),
            user: None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClaudeOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context_length: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>, // Defaults to 0.5. Ranges from 0.0 to 1.0. 
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>, // Same as temperature?
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<String>,
}

impl Default for ClaudeOptions{
    fn default() -> Self {
        ClaudeOptions {
            context_length: None,
            max_tokens: None,
            stream: Some(false),
            temperature: Some(0.5),
            top_p: Some(1.0),
            user: None,
        }
    }
}

#[derive(Default, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OllamaOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context_length: Option<u16>,
    
    /// The size of the context window used to generate the next token. (Default: 2048)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_ctx: Option<u32>,

    /// Maximum number of tokens to predict when generating text. (Default: 128, -1 = infinite generation, -2 = fill context)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_predict: Option<i32>,

    /// The temperature of the model. Increasing the temperature will make the model answer more creatively. (Default: 0.8)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,

    /// Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (Default: 0.9)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
}

#[derive(Default, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MultiModelsOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context_length: Option<u16>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
}