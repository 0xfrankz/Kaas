use sea_orm_migration::prelude::*;

#[derive(DeriveIden)]
enum Prompts {
    Table,
    Id,
    Alias,
    Content,
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
                    .table(Prompts::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Prompts::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Prompts::Alias).string().not_null())
                    .col(ColumnDef::new(Prompts::Content).text().not_null())
                    .col(
                        ColumnDef::new(Prompts::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(ColumnDef::new(Prompts::UpdatedAt).timestamp().null())
                    .col(ColumnDef::new(Prompts::DeletedAt).timestamp().null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Prompts::Table).to_owned())
            .await
    }
}
