use sea_orm_migration::prelude::*;
use super::m20240101_000003_create_conversations::Conversations;

#[derive(DeriveMigrationName)]
pub struct Migration;

const PARENT_ID_COL_NAME: &str = "parent_id";
const IS_MULTI_MODELS_COL_NAME: &str = "is_multi_models";

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add parent_id column
        if !manager.has_column("conversations", PARENT_ID_COL_NAME).await? {
            manager
                .alter_table(
                    Table::alter()
                        .table(Conversations::Table)
                        .add_column(
                            ColumnDef::new(Alias::new(PARENT_ID_COL_NAME))
                                .integer()
                                .null(),
                        )
                        .to_owned(),
                )
                .await?
        }
        // Add is_multi_models column
        if !manager.has_column("conversations", IS_MULTI_MODELS_COL_NAME).await? {
            manager
                .alter_table(
                    Table::alter()
                        .table(Conversations::Table)
                        .add_column(
                            ColumnDef::new(Alias::new(IS_MULTI_MODELS_COL_NAME))
                                .boolean()
                                .default(false),
                        )
                        .to_owned(),
                )
                .await?
        }
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop parent_id column
        if manager.has_column("conversations", PARENT_ID_COL_NAME).await? {
            manager
                .alter_table(
                    Table::alter()
                        .table(Conversations::Table)
                        .drop_column(Alias::new(PARENT_ID_COL_NAME))
                        .to_owned(),
                )
                .await?
        }
        // Drop is_multi_models column
        if manager.has_column("conversations", IS_MULTI_MODELS_COL_NAME).await? {
            manager
                .alter_table(
                    Table::alter()
                        .table(Conversations::Table)
                        .drop_column(Alias::new(IS_MULTI_MODELS_COL_NAME))
                        .to_owned(),
                )
                .await?
        }
        Ok(())
    }
}
