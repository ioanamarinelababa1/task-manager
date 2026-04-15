import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskStatus } from '../task.entity';
import { sanitizeString } from '../../common/utils/sanitize';

export class CreateTaskDto {
  @Transform(({ value }) => sanitizeString(value))
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @Transform(({ value }) => sanitizeString(value))
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
  @IsOptional()
  status?: TaskStatus;
}
