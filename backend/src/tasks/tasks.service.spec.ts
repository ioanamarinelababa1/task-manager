import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './task.entity';
import { User } from '../auth/user.entity';

const mockTask: Task = {
  id: 1,
  userId: 1,
  user: { id: 1, email: 'test@example.com' } as User,
  title: 'Test task',
  description: 'A description',
  status: TaskStatus.TODO,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns only tasks belonging to the user', async () => {
      mockRepository.find.mockResolvedValue([mockTask]);
      const result = await service.findAll(1);
      expect(result).toEqual([mockTask]);
      expect(mockRepository.find).toHaveBeenCalledWith({ where: { userId: 1 } });
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when task does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when task belongs to another user', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      await expect(service.findOne(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('returns the task when it exists and belongs to the user', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      const result = await service.findOne(1, 1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('create', () => {
    it('returns the saved task with userId attached', async () => {
      const dto = {
        title: 'Test task',
        description: 'A description',
        status: TaskStatus.TODO,
      };
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);
      const result = await service.create(dto, 1);
      expect(result).toEqual(mockTask);
      expect(mockRepository.create).toHaveBeenCalledWith({ ...dto, userId: 1 });
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('remove', () => {
    it('calls delete with the correct id', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1, 1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when task does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when task belongs to another user', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
    });
  });
});
