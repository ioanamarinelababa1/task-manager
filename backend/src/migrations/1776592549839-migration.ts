import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1776592549839 implements MigrationInterface {
  name = 'Migration1776592549839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add as nullable first so existing ownerless rows don't block the ALTER
    await queryRunner.query(
      `ALTER TABLE "task" ADD COLUMN IF NOT EXISTS "userId" integer`,
    );
    // Orphaned tasks (no owner) cannot be assigned — remove them
    await queryRunner.query(`DELETE FROM "task" WHERE "userId" IS NULL`);
    // Now safe to enforce NOT NULL
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_f316d3fe53497d4d8a2957db8b9"`,
    );
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "userId"`);
  }
}
