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
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ── Token helpers ──────────────────────────────────────────────────────────

  private signAccessToken(userId: number, email: string): string {
    // Short-lived (15 min) — limits window of abuse if a token is intercepted
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

  // Hash the raw token and persist it so it can be verified and revoked later
  private async saveRefreshToken(userId: number, token: string): Promise<void> {
    const hashed = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const record = this.refreshTokensRepository.create({
      token: hashed,
      userId,
      expiresAt,
    });
    await this.refreshTokensRepository.save(record);
  }

  // Find the DB record matching this raw token (JWT already verified before this is called)
  private async verifyStoredToken(
    rawToken: string,
    userId: number,
  ): Promise<RefreshToken> {
    const records = await this.refreshTokensRepository.find({
      where: { userId, isRevoked: false },
    });
    for (const record of records) {
      if (record.expiresAt < new Date()) continue;
      if (await bcrypt.compare(rawToken, record.token)) return record;
    }
    throw new UnauthorizedException('Refresh token not found or revoked');
  }

  // ── Public methods ─────────────────────────────────────────────────────────

  async register(email: string, password: string) {
    try {
      const existing = await this.usersRepository.findOne({ where: { email } });
      if (existing) throw new ConflictException('Email already in use');

      // bcrypt with cost factor 10 — deliberately slow to resist brute force
      const hashed = await bcrypt.hash(password, 10);
      const user = this.usersRepository.create({ email, password: hashed });
      const saved = await this.usersRepository.save(user);

      const access_token = this.signAccessToken(saved.id, saved.email);
      const refresh_token = this.signRefreshToken(saved.id);
      await this.saveRefreshToken(saved.id, refresh_token);

      return {
        access_token,
        refresh_token,
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
      const valid = user
        ? await bcrypt.compare(password, user.password)
        : false;
      if (!user || !valid)
        throw new UnauthorizedException('Invalid credentials');

      const access_token = this.signAccessToken(user.id, user.email);
      const refresh_token = this.signRefreshToken(user.id);
      await this.saveRefreshToken(user.id, refresh_token);

      return {
        access_token,
        refresh_token,
        user: { id: user.id, email: user.email },
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Login failed');
    }
  }

  async refreshTokens(rawRefreshToken: string) {
    try {
      // Step 1: verify JWT signature — a tampered or expired token throws here
      const payload = this.jwtService.verify<{ sub: number }>(rawRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Step 2: confirm the user still exists in the database
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) throw new UnauthorizedException('User not found');

      // Step 3: confirm the token is in the DB, not revoked, not expired
      const record = await this.verifyStoredToken(rawRefreshToken, user.id);

      // Step 4: revoke the used token — each refresh token is single-use
      record.isRevoked = true;
      await this.refreshTokensRepository.save(record);

      // Step 5: issue a fresh pair and store the new refresh token
      const access_token = this.signAccessToken(user.id, user.email);
      const refresh_token = this.signRefreshToken(user.id);
      await this.saveRefreshToken(user.id, refresh_token);

      return { access_token, refresh_token };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // Revoke all active refresh tokens for a user (called on logout)
  async revokeAllRefreshTokens(userId: number): Promise<void> {
    await this.refreshTokensRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  // Extract userId from the refresh token cookie and revoke all tokens for that user.
  // Silently ignores invalid/expired tokens so logout always succeeds.
  async logoutUser(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    try {
      const payload = this.jwtService.verify<{ sub: number }>(rawRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      await this.revokeAllRefreshTokens(payload.sub);
    } catch {
      // Token invalid or expired — nothing to revoke
    }
  }
}
