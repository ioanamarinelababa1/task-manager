import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

// Cookie configuration shared by both access and refresh token cookies
const COOKIE_BASE = {
  httpOnly: true,                                      // not accessible from JavaScript
  secure: process.env.NODE_ENV === 'production',       // HTTPS only in production
  sameSite: 'strict' as const,                         // blocks cross-site request forgery
};

// All /auth routes: max 10 requests per IP per minute
@Throttle({ default: { ttl: 60_000, limit: 10 } })
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const { access_token, refresh_token, user } = await this.authService.register(
      dto.email,
      dto.password,
    );
    this.setAuthCookies(res, access_token, refresh_token);
    // Return only non-sensitive user data — never return the raw token in the body
    return { user };
  }

  // Tighter limit on login to slow credential-stuffing attacks
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const { access_token, refresh_token, user } = await this.authService.login(
      dto.email,
      dto.password,
    );
    this.setAuthCookies(res, access_token, refresh_token);
    return { user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    const { access_token } = await this.authService.refreshTokens(refreshToken);
    // Issue a new access token cookie — refresh token stays the same
    res.cookie('access_token', access_token, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000,
    });
    return { message: 'Token refreshed' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  me(@Req() req: any) {
    // req.user is populated by JwtStrategy.validate()
    return req.user;
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    // Restrict refresh token cookie to /auth/refresh so it is not sent on every request
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/refresh',
    });
  }
}
