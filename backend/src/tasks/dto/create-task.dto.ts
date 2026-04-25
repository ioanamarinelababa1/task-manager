import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../task.entity';
import { SanitizeHtml } from '../../common/transforms/sanitize.transform';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Buy groceries',
    description: 'Short task title (max 255 chars)',
  })
  @SanitizeHtml()
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @ApiProperty({
    example: 'Milk, eggs, bread',
    description: 'Optional task description (max 1000 chars)',
    required: false,
  })
  @SanitizeHtml()
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.TODO,
    description: 'Initial task status — defaults to TODO',
    required: false,
  })
  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
    description: 'Task priority level — defaults to MEDIUM',
    required: false,
  })
  @IsEnum(TaskPriority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    example: '2026-05-01',
    description: 'Optional due date (ISO 8601)',
    required: false,
  })
  @IsDateString({}, { message: 'dueDate must be a valid ISO 8601 date string' })
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    example: 'Work',
    description: 'Optional category tag (max 50 chars)',
    required: false,
  })
  @SanitizeHtml()
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Category must not exceed 50 characters' })
  category?: string;
}
