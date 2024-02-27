use sea_orm_migration::prelude::*;

#[derive(DeriveIden)]
enum Model {
    Table,
    Id,
    ApiKey,
    Endpoint,
    DeploymentId,
    Provider,
    IsDefault,
    CreatedAt,
    UpdatedAt,
    DeletedAt
}

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Model::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Model::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Model::ApiKey).string().not_null())
                    .col(ColumnDef::new(Model::Endpoint).string().not_null())
                    .col(ColumnDef::new(Model::DeploymentId).string().not_null())
                    .col(ColumnDef::new(Model::Provider).string().not_null())
                    .col(ColumnDef::new(Model::IsDefault).boolean().default(false))
                    .col(ColumnDef::new(Model::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Model::UpdatedAt).timestamp().null())
                    .col(ColumnDef::new(Model::DeletedAt).timestamp().null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Model::Table).to_owned())
            .await
    }
}
