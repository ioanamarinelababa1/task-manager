import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskStatus } from '../task.entity';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
  @IsOptional()
  status?: TaskStatus;
}
