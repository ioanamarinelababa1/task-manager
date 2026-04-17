import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../task.entity';
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
}
