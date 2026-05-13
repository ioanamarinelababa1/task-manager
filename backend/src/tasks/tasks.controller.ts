import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TasksService, PaginationMeta } from './tasks.service';
import { Task, TaskStatus, TaskPriority } from './task.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto, SortField, SortOrder } from './dto/query-tasks.dto';
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
  @ApiOperation({
    summary:
      'List tasks for the authenticated user with pagination, sorting and filtering',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  @ApiQuery({ name: 'priority', required: false, enum: TaskPriority })
  @ApiQuery({ name: 'sortBy', required: false, enum: SortField })
  @ApiQuery({ name: 'order', required: false, enum: SortOrder })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of user tasks',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorised — missing or invalid JWT',
  })
  findAll(
    @Request() req: { user: { id: number } },
    @Query() query: QueryTasksDto,
  ): Promise<{ data: Task[]; meta: PaginationMeta }> {
    return this.tasksService.findAll(req.user.id, query);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Full-text search across tasks' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max results (default 5, max 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Matching tasks ranked by relevance',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorised — missing or invalid JWT',
  })
  async search(
    @Request() req: { user: { id: number } },
    @Query('q') q: string,
    @Query('limit') limit = 5,
  ): Promise<{ data: Task[]; query: string; count: number }> {
    return this.tasksService.search(
      req.user.id,
      q,
      Math.min(Number(limit), 20),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single task by ID' })
  @ApiParam({
    name: 'id',
    description: 'Task ID (positive integer)',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'The requested task', type: Task })
  @ApiResponse({
    status: 401,
    description: 'Unauthorised — missing or invalid JWT',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — task belongs to another user',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ): Promise<Task> {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'The created task', type: Task })
  @ApiResponse({
    status: 400,
    description: 'Validation error — invalid request body',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorised — missing or invalid JWT',
  })
  create(
    @Body() dto: CreateTaskDto,
    @Request() req: { user: { id: number } },
  ): Promise<Task> {
    return this.tasksService.create(dto, req.user.id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing task' })
  @ApiParam({
    name: 'id',
    description: 'Task ID (positive integer)',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'The updated task', type: Task })
  @ApiResponse({
    status: 400,
    description: 'Validation error — invalid request body',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorised — missing or invalid JWT',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — task belongs to another user',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @Request() req: { user: { id: number } },
  ): Promise<Task> {
    // TODO: remove after confirming 400 is resolved in production
    console.log('[UpdateTask] id=%d body=%s', id, JSON.stringify(dto));
    return this.tasksService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({
    name: 'id',
    description: 'Task ID (positive integer)',
    example: 1,
  })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorised — missing or invalid JWT',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — task belongs to another user',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Request() req: { user: { id: number } },
  ): Promise<void> {
    return this.tasksService.remove(id, req.user.id);
  }
}
