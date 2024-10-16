use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let insert = Query::insert()
            .into_table(Prompts::Table)
            .columns([Prompts::Alias, Prompts::Content])
            .values_panic(["Zero-shot COT".into(), "Q:{Question}\nA:Think step by step, writing out your thoughts. Once all your thoughts are done, write the final in markdown format with the header: 'Answer'.".into()])
            .values_panic(["COSTAR".into(), "# CONTEXT #\n{Context}\n\n# OBJECTIVE #\n{Objective}\n\n# STYLE #\n{Style}\n\n# TONE #\n{Tone}\n\n# AUDIENCE #\n{Audience}\n\n# RESPONSE #\n".into()])
            .to_owned();

        manager.exec_stmt(insert).await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let delete = Query::delete().from_table(Prompts::Table).to_owned();

        manager.exec_stmt(delete).await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Prompts {
    Table,
    Alias,
    Content,
}
