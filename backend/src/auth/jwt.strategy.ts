import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      // Try the httpOnly cookie first (browser clients), fall back to Bearer header
      // (API clients such as Postman or cURL that cannot use cookies).
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const cookies = req?.cookies as Record<string, string> | undefined;
          return cookies?.['access_token'] ?? null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: { sub: number; email: string }): {
    id: number;
    email: string;
  } {
    return { id: payload.sub, email: payload.email };
  }
}
