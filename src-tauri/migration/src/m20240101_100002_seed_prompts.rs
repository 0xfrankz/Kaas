use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let insert = Query::insert()
            .into_table(Prompts::Table)
            .columns([Prompts::Alias, Prompts::Content])
            .values_panic(["Zero-shot COT".into(), "Q:{Question}\nR:Réfléchissez étape par étape, en écrivant vos pensées. Une fois toutes vos réflexions terminées, écrivez la réponse finale au format markdown avec l'en-tête : 'Réponse'.".into()])
            .values_panic(["COSTAR".into(), "# CONTEXTE #\n{Context}\n\n# OBJECTIF #\n{Objective}\n\n# STYLE #\n{Style}\n\n# TON #\n{Tone}\n\n# AUDIENCE #\n{Audience}\n\n# RÉPONSE #\n".into()])
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
