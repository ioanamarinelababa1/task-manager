import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../task.entity';
import { sanitizeString } from '../../common/utils/sanitize';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Buy groceries',
    description: 'Short task title (max 255 chars)',
  })
  @Transform(({ value }) => sanitizeString(value))
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @ApiProperty({
    example: 'Milk, eggs, bread',
    description: 'Optional task description (max 1000 chars)',
    required: false,
  })
  @Transform(({ value }) => sanitizeString(value))
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
}
