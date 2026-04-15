import {
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

  async findAll(): Promise<Task[]> {
    try {
      return await this.tasksRepository.find();
    } catch {
      throw new InternalServerErrorException('Failed to fetch tasks');
    }
  }

  async findOne(id: number): Promise<Task> {
    try {
      const task = await this.tasksRepository.findOne({ where: { id } });
      if (!task) throw new NotFoundException(`Task #${id} not found`);
      return task;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to fetch task');
    }
  }

  async create(dto: CreateTaskDto): Promise<Task> {
    try {
      const task = this.tasksRepository.create(dto);
      return await this.tasksRepository.save(task);
    } catch {
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    try {
      await this.findOne(id); // throws 404 if not found before attempting update
      await this.tasksRepository.update(id, dto);
      return this.findOne(id);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.findOne(id); // throws 404 if not found before attempting delete
      await this.tasksRepository.delete(id);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException('Failed to delete task');
    }
  }
}
