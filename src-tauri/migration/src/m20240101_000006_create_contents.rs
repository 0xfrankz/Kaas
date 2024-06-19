use sea_orm_migration::prelude::*;

#[derive(DeriveIden)]
enum Contents {
    Table,
    Id,
    MessageId,
    Type,
    Text,
    FileName,
    FileSize,
    FileType,
    FileLastModified,
    FileData
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Contents::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Contents::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Contents::MessageId).integer().not_null())
                    .col(ColumnDef::new(Contents::Type).integer().not_null())
                    .col(ColumnDef::new(Contents::Text).text().null())
                    .col(ColumnDef::new(Contents::FileName).string().null())
                    .col(ColumnDef::new(Contents::FileSize).unsigned().null())
                    .col(ColumnDef::new(Contents::FileType).string().null())
                    .col(ColumnDef::new(Contents::FileData).binary().null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("FK__contents_messages")
                            .from(Contents::Table, Contents::MessageId)
                            .to(super::m20240101_000004_create_messages::Messages::Table, super::m20240101_000004_create_messages::Messages::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade)
                    )
                    .to_owned(),
                )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Contents::Table).to_owned())
            .await
    }
}
