pub use sea_orm_migration::prelude::*;

mod m20240101_000001_create_models;
mod m20240101_000002_create_settings;
mod m20240101_000003_create_conversations;
mod m20240101_000004_create_messages;
mod m20240101_000005_create_prompts;
mod m20240101_000006_create_contents;
mod m20240101_100001_seed_settings;
mod m20240101_100002_seed_prompts;
mod m20240820_000001_conversations_add_last_message_at;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240101_000001_create_models::Migration),
            Box::new(m20240101_000002_create_settings::Migration),
            Box::new(m20240101_000003_create_conversations::Migration),
            Box::new(m20240101_000004_create_messages::Migration),
            Box::new(m20240101_000005_create_prompts::Migration),
            Box::new(m20240101_000006_create_contents::Migration),
            Box::new(m20240101_100001_seed_settings::Migration),
            Box::new(m20240101_100002_seed_prompts::Migration),
            Box::new(m20240820_000001_conversations_add_last_message_at::Migration),
        ]
    }
}
