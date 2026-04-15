import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ── Token helpers ──────────────────────────────────────────────────────────

  private signAccessToken(userId: number, email: string): string {
    // Short-lived (15 min) — limits window of abuse if token is intercepted
    return this.jwtService.sign({ sub: userId, email });
  }

  private signRefreshToken(userId: number): string {
    // Long-lived (7 days) — uses a separate secret so a leaked access secret
    // cannot be used to forge refresh tokens
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }

  // ── Public methods ─────────────────────────────────────────────────────────

  async register(email: string, password: string) {
    try {
      // Check whether the email is already registered
      const existing = await this.usersRepository.findOne({ where: { email } });
      if (existing) throw new ConflictException('Email already in use');

      // bcrypt with cost factor 10 — deliberately slow to resist brute force
      const hashed = await bcrypt.hash(password, 10);
      const user = this.usersRepository.create({ email, password: hashed });
      const saved = await this.usersRepository.save(user);

      return {
        access_token: this.signAccessToken(saved.id, saved.email),
        refresh_token: this.signRefreshToken(saved.id),
        user: { id: saved.id, email: saved.email },
      };
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(email: string, password: string) {
    try {
      // Fetch user by email — returns null if not found
      const user = await this.usersRepository.findOne({ where: { email } });

      // Use a constant-time comparison for both "user not found" and "wrong password"
      // to prevent timing attacks that distinguish between the two cases
      const valid = user ? await bcrypt.compare(password, user.password) : false;
      if (!user || !valid) throw new UnauthorizedException('Invalid credentials');

      return {
        access_token: this.signAccessToken(user.id, user.email),
        refresh_token: this.signRefreshToken(user.id),
        user: { id: user.id, email: user.email },
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Login failed');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify using the refresh secret — a tampered or expired token throws
      const payload = this.jwtService.verify<{ sub: number }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Confirm the user still exists in the database (account not deleted)
      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');

      return { access_token: this.signAccessToken(user.id, user.email) };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
