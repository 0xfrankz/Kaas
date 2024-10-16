use sea_orm_migration::prelude::*;

#[derive(DeriveIden)]
pub enum Conversations {
    Table,
    Id,
    ModelId,
    Subject,
    Options,
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
                    .table(Conversations::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Conversations::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Conversations::ModelId).integer())
                    .col(ColumnDef::new(Conversations::Subject).string().not_null())
                    .col(ColumnDef::new(Conversations::Options).string())
                    .col(
                        ColumnDef::new(Conversations::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(ColumnDef::new(Conversations::UpdatedAt).timestamp().null())
                    .col(ColumnDef::new(Conversations::DeletedAt).timestamp().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("FK_conversations_models")
                            .from(Conversations::Table, Conversations::ModelId)
                            .to(
                                super::m20240101_000001_create_models::Models::Table,
                                super::m20240101_000001_create_models::Models::Id,
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
            .drop_table(Table::drop().table(Conversations::Table).to_owned())
            .await
    }
}
