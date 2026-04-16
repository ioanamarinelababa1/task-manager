import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity()
export class Task {
  @ApiProperty({ example: 1, description: 'Unique task identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Buy groceries', description: 'Short task title (max 255 chars)' })
  @Column()
  title: string;

  @ApiProperty({ example: 'Milk, eggs, bread', description: 'Optional task description (max 1000 chars)', required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.TODO, description: 'Current task status' })
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @ApiProperty({ example: '2026-04-17T10:00:00.000Z', description: 'Timestamp when the task was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-04-17T12:00:00.000Z', description: 'Timestamp when the task was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;
}
