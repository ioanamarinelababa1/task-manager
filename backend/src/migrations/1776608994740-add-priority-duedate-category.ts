import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriorityDuedateCategory1776608994740 implements MigrationInterface {
  name = 'AddPriorityDuedateCategory1776608994740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN
        CREATE TYPE "public"."task_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH');
      EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "priority" "public"."task_priority_enum" NOT NULL DEFAULT 'MEDIUM'`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "dueDate" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "category" character varying(50)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" DROP COLUMN IF EXISTS "category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP COLUMN IF EXISTS "dueDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" DROP COLUMN IF EXISTS "priority"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."task_priority_enum"`,
    );
  }
}
