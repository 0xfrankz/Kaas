use sea_orm_migration::prelude::*;

#[derive(DeriveIden)]
pub enum Models {
    Table,
    Id,
    Alias,
    Provider,
    Config,
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
                    .table(Models::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Models::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Models::Alias).string().not_null())
                    .col(ColumnDef::new(Models::Provider).string().not_null())
                    .col(ColumnDef::new(Models::Config).json().not_null())
                    .col(
                        ColumnDef::new(Models::CreatedAt)
                            .timestamp()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(ColumnDef::new(Models::UpdatedAt).timestamp().null())
                    .col(ColumnDef::new(Models::DeletedAt).timestamp().null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Models::Table).to_owned())
            .await
    }
}
