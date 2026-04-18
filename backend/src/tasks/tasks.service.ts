import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async findAll(userId: number): Promise<Task[]> {
    try {
      return await this.tasksRepository.find({ where: { userId } });
    } catch {
      throw new InternalServerErrorException('Failed to fetch tasks');
    }
  }

  async findOne(id: number, userId: number): Promise<Task> {
    try {
      const task = await this.tasksRepository.findOne({ where: { id } });
      if (!task) throw new NotFoundException(`Task #${id} not found`);
      if (task.userId !== userId) throw new ForbiddenException('Access denied');
      return task;
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException)
        throw err;
      throw new InternalServerErrorException('Failed to fetch task');
    }
  }

  async create(dto: CreateTaskDto, userId: number): Promise<Task> {
    try {
      const task = this.tasksRepository.create({ ...dto, userId });
      return await this.tasksRepository.save(task);
    } catch {
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async update(id: number, dto: UpdateTaskDto, userId: number): Promise<Task> {
    try {
      await this.findOne(id, userId);
      await this.tasksRepository.update(id, dto);
      return this.findOne(id, userId);
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException)
        throw err;
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    try {
      await this.findOne(id, userId);
      await this.tasksRepository.delete(id);
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException)
        throw err;
      throw new InternalServerErrorException('Failed to delete task');
    }
  }
}
