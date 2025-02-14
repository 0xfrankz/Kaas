use super::m20240101_000004_create_messages::Messages;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

const REASONING_COL_NAME: &str = "reasoning";
const REASONING_TOKEN_COL_NAME: &str = "reasoning_token";

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if !manager.has_column("messages", REASONING_COL_NAME).await? {
            manager
                .alter_table(
                    Table::alter()
                        .table(Messages::Table)
                        .add_column(ColumnDef::new(Alias::new(REASONING_COL_NAME)).text().null())
                        .to_owned(),
                )
                .await?;
        }
        if !manager.has_column("messages", REASONING_TOKEN_COL_NAME).await? {
            manager
                .alter_table(
                    Table::alter()
                        .table(Messages::Table)
                        .add_column(ColumnDef::new(Alias::new(REASONING_TOKEN_COL_NAME)).integer().null())
                        .to_owned(),
                )
                .await?;
        }
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.has_column("messages", REASONING_COL_NAME).await? {
            manager
                .alter_table(
                    Table::alter()
                        .table(Messages::Table)
                        .drop_column(Alias::new(REASONING_COL_NAME))
                        .to_owned(),
                )
                .await?;
        }
        if manager.has_column("messages", REASONING_TOKEN_COL_NAME).await? {
            manager
                .alter_table(
                    Table::alter()
                        .table(Messages::Table)
                        .drop_column(Alias::new(REASONING_TOKEN_COL_NAME))
                        .to_owned(),
                )
                .await?;
        }
        Ok(())
    }
}