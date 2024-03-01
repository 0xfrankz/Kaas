pub use sea_orm_migration::prelude::*;

mod m20240223_143755_create_models;
mod m20240228_150548_create_settings;
mod m20240301_024630_create_conversations;
mod m20240301_024644_create_messages;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240223_143755_create_models::Migration),
            Box::new(m20240228_150548_create_settings::Migration),
            Box::new(m20240301_024630_create_conversations::Migration),
            Box::new(m20240301_024644_create_messages::Migration),
        ]
    }
}
