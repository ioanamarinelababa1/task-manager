import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from './user.entity';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  password: '$2a$10$hashedpassword',
  createdAt: new Date(),
};

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-token'),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('refresh-secret'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('creates a user with a hashed password', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockImplementation(
        (data: Partial<User>) => data as User,
      );
      mockRepository.save.mockImplementation((u: User) =>
        Promise.resolve({ ...u, id: 1 }),
      );
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockJwtService.sign.mockReturnValue('access-token');

      const result = await service.register('test@example.com', 'plaintext');

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
      expect(result).toHaveProperty('access_token');
    });

    it('throws ConflictException when email is already in use', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      await expect(service.register('test@example.com', 'pw')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for wrong password', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login('test@example.com', 'wrongpw'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns accessToken on successful login', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('access-token');

      const result = await service.login('test@example.com', 'correctpw');
      expect(result).toHaveProperty('access_token', 'access-token');
      expect(result.user).toEqual({ id: mockUser.id, email: mockUser.email });
    });
  });
});
