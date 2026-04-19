import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../auth/user.entity';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity()
export class Task {
  @ApiProperty({ example: 1, description: 'Unique task identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the user who owns this task' })
  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    example: 'Buy groceries',
    description: 'Short task title (max 255 chars)',
  })
  @Column()
  title: string;

  @ApiProperty({
    example: 'Milk, eggs, bread',
    description: 'Optional task description (max 1000 chars)',
    required: false,
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.TODO,
    description: 'Current task status',
  })
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    description: 'Task priority level — defaults to MEDIUM',
    required: false,
  })
  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @ApiProperty({
    example: '2026-05-01T00:00:00.000Z',
    description: 'Optional due date',
    required: false,
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date | null;

  @ApiProperty({
    example: 'Work',
    description: 'Optional category tag (max 50 chars)',
    required: false,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string | null;

  @ApiProperty({
    example: '2026-04-17T10:00:00.000Z',
    description: 'Timestamp when the task was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2026-04-17T12:00:00.000Z',
    description: 'Timestamp when the task was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
