import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../task.entity';
import { sanitizeString } from '../../common/utils/sanitize';

export class UpdateTaskDto {
  @ApiProperty({
    example: 'Buy groceries',
    description: 'Updated task title (max 255 chars)',
    required: false,
  })
  @Transform(({ value }) => sanitizeString(value))
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @ApiProperty({
    example: 'Milk, eggs, bread',
    description: 'Updated task description (max 1000 chars)',
    required: false,
  })
  @Transform(({ value }) => sanitizeString(value))
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    description: 'Updated task status',
    required: false,
  })
  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Updated task priority level',
    required: false,
  })
  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    example: '2026-05-01',
    description: 'Updated due date (ISO 8601)',
    required: false,
  })
  @IsDateString({}, { message: 'dueDate must be a valid ISO 8601 date string' })
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    example: 'Work',
    description: 'Updated category tag (max 50 chars)',
    required: false,
  })
  @Transform(({ value }) => sanitizeString(value))
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Category must not exceed 50 characters' })
  category?: string;
}
