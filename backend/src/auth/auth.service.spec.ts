import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';

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

const mockRefreshTokenRecord: RefreshToken = {
  id: 1,
  token: '$2a$10$hashedrefreshtoken',
  userId: 1,
  user: mockUser,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isRevoked: false,
  createdAt: new Date(),
};

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockRefreshTokenRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-token'),
  verify: jest.fn(),
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
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
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
    it('creates a user and saves a hashed refresh token', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation(
        (data: Partial<User>) => data as User,
      );
      mockUserRepository.save.mockResolvedValue({ ...mockUser, id: 1 });
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-password') // password hash
        .mockResolvedValueOnce('hashed-refresh-token'); // token hash
      mockJwtService.sign.mockReturnValue('signed-token');
      mockRefreshTokenRepository.create.mockImplementation(
        (data: Partial<RefreshToken>) => data as RefreshToken,
      );
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshTokenRecord);

      const result = await service.register('test@example.com', 'plaintext');

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
      expect(mockRefreshTokenRepository.create).toHaveBeenCalled();
      expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    it('throws ConflictException when email is already in use', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      await expect(service.register('test@example.com', 'pw')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for wrong password', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login('test@example.com', 'wrongpw'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns access and refresh tokens on successful login', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      mockJwtService.sign.mockReturnValue('access-token');
      mockRefreshTokenRepository.create.mockImplementation(
        (data: Partial<RefreshToken>) => data as RefreshToken,
      );
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshTokenRecord);

      const result = await service.login('test@example.com', 'correctpw');

      expect(result).toHaveProperty('access_token', 'access-token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user).toEqual({ id: mockUser.id, email: mockUser.email });
    });
  });

  describe('refreshTokens', () => {
    it('rotates the refresh token and returns a new pair', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1 });
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRefreshTokenRepository.find.mockResolvedValue([
        mockRefreshTokenRecord,
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      // save call for revoking old token + save call for new token
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshTokenRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-token');
      mockRefreshTokenRepository.create.mockImplementation(
        (data: Partial<RefreshToken>) => data as RefreshToken,
      );
      mockJwtService.sign.mockReturnValue('new-token');

      const result = await service.refreshTokens('raw-refresh-token');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      // Old record should have been saved with isRevoked = true
      expect(mockRefreshTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isRevoked: true }),
      );
    });

    it('throws UnauthorizedException when JWT signature is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });
      await expect(service.refreshTokens('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when token is not found in DB', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1 });
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRefreshTokenRepository.find.mockResolvedValue([]);

      await expect(service.refreshTokens('raw-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeAllRefreshTokens', () => {
    it('marks all active tokens as revoked', async () => {
      mockRefreshTokenRepository.update.mockResolvedValue({ affected: 1 });
      await service.revokeAllRefreshTokens(1);
      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: 1, isRevoked: false },
        { isRevoked: true },
      );
    });
  });

  describe('logoutUser', () => {
    it('does nothing when no token is provided', async () => {
      await service.logoutUser(undefined);
      expect(mockRefreshTokenRepository.update).not.toHaveBeenCalled();
    });

    it('revokes all tokens when a valid token is provided', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1 });
      mockRefreshTokenRepository.update.mockResolvedValue({ affected: 1 });
      await service.logoutUser('raw-refresh-token');
      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: 1, isRevoked: false },
        { isRevoked: true },
      );
    });

    it('silently ignores an invalid refresh token on logout', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });
      await expect(service.logoutUser('bad-token')).resolves.not.toThrow();
    });
  });

  describe('Security', () => {
    it('register should hash password before saving (never store plain text)', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockImplementation(
        (data: Partial<User>) => data as User,
      );
      mockUserRepository.save.mockResolvedValue({ ...mockUser, id: 1 });
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed-password')
        .mockResolvedValueOnce('hashed-refresh-token');
      mockJwtService.sign.mockReturnValue('signed-token');
      mockRefreshTokenRepository.create.mockImplementation(
        (data: Partial<RefreshToken>) => data as RefreshToken,
      );
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshTokenRecord);

      await service.register('test@example.com', 'plaintext');

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
      const savedArgs = mockUserRepository.create.mock.calls[0][0];
      expect(savedArgs.password).toBe('hashed-password');
      expect(savedArgs.password).not.toBe('plaintext');
    });

    it('login should throw UnauthorizedException for non-existent email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(
        service.login('ghost@example.com', 'anypassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('login should throw UnauthorizedException for wrong password even if user exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('refresh should throw UnauthorizedException for revoked token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1 });
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      // DB returns empty because the revoked token is filtered by isRevoked: false
      mockRefreshTokenRepository.find.mockResolvedValue([]);
      await expect(service.refreshTokens('revoked-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('refresh should revoke old token and issue new one (rotation)', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1 });
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRefreshTokenRepository.find.mockResolvedValue([
        mockRefreshTokenRecord,
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshTokenRecord);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-token');
      mockRefreshTokenRepository.create.mockImplementation(
        (data: Partial<RefreshToken>) => data as RefreshToken,
      );
      mockJwtService.sign.mockReturnValue('new-token');

      const result = await service.refreshTokens('raw-refresh-token');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockRefreshTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isRevoked: true }),
      );
    });
  });
});
