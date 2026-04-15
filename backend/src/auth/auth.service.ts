import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    try {
      const existing = await this.usersRepository.findOne({ where: { email } });
      if (existing) throw new ConflictException('Email already in use');

      const hashed = await bcrypt.hash(password, 10);
      const user = this.usersRepository.create({ email, password: hashed });
      const saved = await this.usersRepository.save(user);

      const access_token = this.jwtService.sign({ sub: saved.id, email: saved.email });
      return { access_token, user: { id: saved.id, email: saved.email } };
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UnauthorizedException('Invalid credentials');

      const access_token = this.jwtService.sign({ sub: user.id, email: user.email });
      return { access_token, user: { id: user.id, email: user.email } };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Login failed');
    }
  }
}
