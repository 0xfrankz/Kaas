use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let insert = Query::insert()
            .into_table(Settings::Table)
            .columns([Settings::Key, Settings::Value])
            .values_panic(["display:language".into(), "en".into()])
            .values_panic(["display:darkmode".into(), "system".into()])
            .to_owned();

        manager.exec_stmt(insert).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let delete = Query::delete().from_table(Settings::Table).to_owned();

        manager.exec_stmt(delete).await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Settings {
    Table,
    Key,
    Value,
}
