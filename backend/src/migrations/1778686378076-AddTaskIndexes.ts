import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskIndexes1778686378076 implements MigrationInterface {
  public transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_userId" ON "task" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_status" ON "task" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_priority" ON "task" ("priority")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_dueDate" ON "task" ("dueDate")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_userId_status" ON "task" ("userId", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_userId_priority" ON "task" ("userId", "priority")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_userId_createdAt" ON "task" ("userId", "createdAt" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_title_search" ON "task" USING gin(to_tsvector('english', "title"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_description_search" ON "task" USING gin(to_tsvector('english', coalesce("description", '')))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_priority"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_dueDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_userId_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_userId_priority"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_userId_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_title_search"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_task_description_search"`,
    );
  }
}
