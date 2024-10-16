use super::m20240101_000003_create_conversations::Conversations;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

const COL_NAME: &str = "last_message_at";

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if !manager.has_column("conversations", COL_NAME).await? {
            manager
                .alter_table(
                    Table::alter()
                        .table(Conversations::Table)
                        .add_column(ColumnDef::new(Alias::new(COL_NAME)).timestamp().null())
                        .to_owned(),
                )
                .await?
        }
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager
            .has_column("conversations", "last_message_at")
            .await?
        {
            manager
                .alter_table(
                    Table::alter()
                        .table(Conversations::Table)
                        .drop_column(Alias::new(COL_NAME))
                        .to_owned(),
                )
                .await?
        }
        Ok(())
    }
}
