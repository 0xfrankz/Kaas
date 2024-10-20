//! `SeaORM` Entity. Generated by sea-orm-codegen 0.12.14

use sea_orm::entity::prelude::*;
use sea_orm::entity::Linked;
use sea_orm::ActiveValue::{NotSet, Set};
use sea_orm::IntoActiveModel;
use serde::{Deserialize, Serialize};

use super::contents::{ContentDTO, ContentType};

pub enum Roles {
    User,
    Bot,
    System,
}

impl Into<i32> for Roles {
    fn into(self) -> i32 {
        match self {
            Roles::User => 0,
            Roles::Bot => 1,
            Roles::System => 2,
        }
    }
}

impl From<i32> for Roles {
    fn from(value: i32) -> Self {
        match value {
            0 => Roles::User,
            1 => Roles::Bot,
            2 => Roles::System,
            _ => panic!("Invalid role"),
        }
    }
}

#[derive(Clone, Default, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]
#[sea_orm(table_name = "messages")]
#[serde(rename_all = "camelCase")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub conversation_id: i32,
    pub role: i32,
    // token usage
    pub prompt_token: Option<u32>,
    pub completion_token: Option<u32>,
    pub total_token: Option<u32>,
    #[serde(skip_deserializing)]
    pub created_at: DateTimeLocal,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub updated_at: Option<DateTimeLocal>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub deleted_at: Option<DateTimeLocal>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::conversations::Entity",
        from = "Column::ConversationId",
        to = "super::conversations::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Conversations,
    #[sea_orm(has_many = "super::contents::Entity")]
    Contents,
}

impl Related<super::conversations::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Conversations.def()
    }
}

impl Related<super::contents::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Contents.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}

/**
 * Relation link from Message to Model
 */
pub struct MessageToModel;

impl Linked for MessageToModel {
    type FromEntity = Entity;
    type ToEntity = super::models::Entity;

    fn link(&self) -> Vec<RelationDef> {
        vec![
            Relation::Conversations.def(),
            super::conversations::Relation::Models.def(),
        ]
    }
}

#[derive(Clone, Default, Debug, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub struct MessageDTO {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<i32>,
    pub conversation_id: i32,
    pub role: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prompt_token: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub completion_token: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_token: Option<u32>,
    #[serde(skip_deserializing)]
    pub created_at: DateTimeLocal,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub updated_at: Option<DateTimeLocal>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(skip_deserializing)]
    pub deleted_at: Option<DateTimeLocal>,
    pub content: Vec<ContentDTO>,
}

impl MessageDTO {
    pub fn get_text(&self) -> Option<String> {
        self.content.iter().find_map(|item| {
            if item.r#type == ContentType::Text {
                Some(item.data.clone())
            } else {
                None
            }
        })
    }
}

impl From<(Model, Vec<super::contents::Model>)> for MessageDTO {
    fn from(value: (Model, Vec<super::contents::Model>)) -> Self {
        let message = value.0;
        let contents = value.1;
        MessageDTO {
            id: Some(message.id),
            conversation_id: message.conversation_id,
            role: message.role,
            prompt_token: message.prompt_token,
            completion_token: message.completion_token,
            total_token: message.total_token,
            created_at: message.created_at,
            updated_at: message.updated_at,
            deleted_at: message.deleted_at,
            content: contents.into_iter().map(|content| content.into()).collect(),
        }
    }
}

impl IntoActiveModel<ActiveModel> for MessageDTO {
    fn into_active_model(self) -> ActiveModel {
        ActiveModel {
            id: self.id.map_or(NotSet, |id| Set(id)),
            conversation_id: Set(self.conversation_id),
            role: Set(self.role),
            prompt_token: self
                .prompt_token
                .map_or(NotSet, |prompt_token| Set(Some(prompt_token))),
            completion_token: self
                .completion_token
                .map_or(NotSet, |completion_token| Set(Some(completion_token))),
            total_token: self
                .total_token
                .map_or(NotSet, |total_token| Set(Some(total_token))),
            ..Default::default()
        }
    }
}
