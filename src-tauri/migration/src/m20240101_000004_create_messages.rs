use sea_orm_migration::prelude::*;

#[derive(DeriveIden)]
pub enum Messages {
    Table,
    Id,
    ConversationId,
    Role,
    PromptToken,
    CompletionToken,
    TotalToken,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Messages::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Messages::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Messages::ConversationId)
                            .integer()
                            .not_null(),
                    )
                    .col(ColumnDef::new(Messages::Role).integer().not_null())
                    .col(ColumnDef::new(Messages::PromptToken).integer().null())
                    .col(ColumnDef::new(Messages::CompletionToken).integer().null())
                    .col(ColumnDef::new(Messages::TotalToken).integer().null())
                    .col(
                        ColumnDef::new(Messages::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(ColumnDef::new(Messages::UpdatedAt).timestamp().null())
                    .col(ColumnDef::new(Messages::DeletedAt).timestamp().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("FK_messages_conversations")
                            .from(Messages::Table, Messages::ConversationId)
                            .to(
                                super::m20240101_000003_create_conversations::Conversations::Table,
                                super::m20240101_000003_create_conversations::Conversations::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Messages::Table).to_owned())
            .await
    }
}
