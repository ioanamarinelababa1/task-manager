import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskPriority, TaskStatus } from './task.entity';
import { User } from '../auth/user.entity';

const mockTask: Task = {
  id: 1,
  userId: 1,
  user: { id: 1, email: 'test@example.com' } as User,
  title: 'Test task',
  description: 'A description',
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  dueDate: null,
  category: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  setParameter: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
  getMany: jest.fn(),
};

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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
    it('returns paginated tasks with correct meta', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTask], 1]);
      const result = await service.findAll(1, {});
      expect(result.data).toEqual([mockTask]);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('returns only tasks belonging to the user', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTask], 1]);
      await service.findAll(1, {});
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'task.userId = :userId',
        { userId: 1 },
      );
    });

    it('applies status filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTask], 1]);
      await service.findAll(1, { status: TaskStatus.TODO });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'task.status = :status',
        { status: TaskStatus.TODO },
      );
    });

    it('applies full-text search filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTask], 1]);
      await service.findAll(1, { search: 'test' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "to_tsvector('english', task.title || ' ' || coalesce(task.description, '') || ' ' || coalesce(task.category, '')) @@ plainto_tsquery('english', :search)",
        { search: 'test' },
      );
    });

    it('returns empty data and zero meta when user has no tasks', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      const result = await service.findAll(42, {});
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(false);
    });
  });

  describe('Pagination', () => {
    it('returns correct meta for page 2 of 3', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTask], 25]);
      const result = await service.findAll(1, { page: 2, limit: 10 });
      expect(result.meta).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('hasNextPage is false on the last page', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTask], 10]);
      const result = await service.findAll(1, { page: 1, limit: 10 });
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it('hasPreviousPage is false on page 1', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTask], 20]);
      const result = await service.findAll(1, { page: 1, limit: 10 });
      expect(result.meta.hasPreviousPage).toBe(false);
      expect(result.meta.hasNextPage).toBe(true);
    });

    it('respects custom limit', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTask], 50]);
      const result = await service.findAll(1, { page: 1, limit: 25 });
      expect(result.meta.limit).toBe(25);
      expect(result.meta.totalPages).toBe(2);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(25);
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

  describe('Ownership enforcement', () => {
    it('findOne should throw ForbiddenException when userId does not match task owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      await expect(service.findOne(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('update should throw ForbiddenException when userId does not match task owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      await expect(service.update(1, { title: 'hacked' }, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('remove should throw ForbiddenException when userId does not match task owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      await expect(service.remove(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('findAll should only return tasks belonging to the requesting user', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTask], 1]);
      const result = await service.findAll(1, {});
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'task.userId = :userId',
        { userId: 1 },
      );
      expect(result.data).toEqual([mockTask]);
    });

    it('create should attach the requesting userId to the new task', async () => {
      const dto = { title: 'Test task', status: TaskStatus.TODO };
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);
      await service.create(dto, 1);
      expect(mockRepository.create).toHaveBeenCalledWith({ ...dto, userId: 1 });
    });
  });

  describe('Edge cases', () => {
    it('findOne should throw NotFoundException when task does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99, 1)).rejects.toThrow(NotFoundException);
    });

    it('findAll should return empty data when user has no tasks', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      const result = await service.findAll(42, {});
      expect(result.data).toEqual([]);
    });

    it('create should set default status TODO when no status provided', async () => {
      const dto = { title: 'No-status task' };
      const savedTask = { ...mockTask, status: TaskStatus.TODO };
      mockRepository.create.mockReturnValue(savedTask);
      mockRepository.save.mockResolvedValue(savedTask);
      const result = await service.create(dto, 1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: 'No-status task',
        userId: 1,
      });
      expect(result.status).toBe(TaskStatus.TODO);
    });
  });

  describe('Data isolation', () => {
    it('user 1 tasks should not be visible to user 2', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask); // task owned by userId: 1
      await expect(service.findOne(mockTask.id, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('user 2 should not be able to delete user 1 task', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask); // task owned by userId: 1
      await expect(service.remove(mockTask.id, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('search', () => {
    it('returns empty result for empty string without querying the DB', async () => {
      const result = await service.search(1, '', 5);
      expect(result).toEqual({ data: [], query: '', count: 0 });
      expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('returns empty result for query shorter than 2 characters', async () => {
      const result = await service.search(1, 'a', 5);
      expect(result).toEqual({ data: [], query: 'a', count: 0 });
      expect(mockRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('sanitizes query: trims whitespace and truncates to 100 characters', async () => {
      const longQuery = 'x'.repeat(120);
      const truncated = 'x'.repeat(100);
      mockQueryBuilder.getMany.mockResolvedValue([]);
      await service.search(1, longQuery, 5);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('plainto_tsquery'),
        { query: truncated },
      );
      expect(mockQueryBuilder.setParameter).toHaveBeenCalledWith(
        'rankQuery',
        truncated,
      );
    });

    it('filters results by userId', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockTask]);
      await service.search(42, 'test query', 5);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'task.userId = :userId',
        { userId: 42 },
      );
    });

    it('respects limit parameter', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockTask]);
      await service.search(1, 'test', 10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });
});
