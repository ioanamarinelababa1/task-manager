import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe';

// All /tasks routes: max 60 requests per IP per minute (authenticated users only)
@ApiTags('tasks')
@ApiBearerAuth()
@Throttle({ default: { ttl: 60_000, limit: 60 } })
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all tasks' })
  @ApiResponse({ status: 200, description: 'Array of all tasks', type: [Task] })
  @ApiResponse({ status: 401, description: 'Unauthorised — missing or invalid JWT' })
  findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID (positive integer)', example: 1 })
  @ApiResponse({ status: 200, description: 'The requested task', type: Task })
  @ApiResponse({ status: 401, description: 'Unauthorised — missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id', ParsePositiveIntPipe) id: number): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'The created task', type: Task })
  @ApiResponse({ status: 400, description: 'Validation error — invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorised — missing or invalid JWT' })
  create(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing task' })
  @ApiParam({ name: 'id', description: 'Task ID (positive integer)', example: 1 })
  @ApiResponse({ status: 200, description: 'The updated task', type: Task })
  @ApiResponse({ status: 400, description: 'Validation error — invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorised — missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID (positive integer)', example: 1 })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorised — missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id', ParsePositiveIntPipe) id: number): Promise<void> {
    return this.tasksService.remove(id);
  }
}
