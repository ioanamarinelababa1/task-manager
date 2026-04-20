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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from './user.entity';

interface AuthenticatedRequest extends Request {
  user: { id: number; email: string };
}

// In production the frontend and backend are on different domains, so cookies
// must use sameSite:'none' (requires secure:true). In development sameSite:'lax'
// works for same-origin and does not require HTTPS.
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_BASE = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
};

// All /auth routes: max 10 requests per IP per minute
@ApiTags('auth')
@Throttle({ default: { ttl: 60_000, limit: 10 } })
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({
    status: 201,
    description:
      'Account created — access and refresh tokens set as httpOnly cookies',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error — invalid email or weak password',
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.register(dto.email, dto.password);
    this.setAuthCookies(res, access_token, refresh_token);
    // Also return the token in the body so clients where cross-domain cookies are
    // blocked (iOS Safari ITP) can fall back to Authorization: Bearer header auth.
    return { user, access_token };
  }

  // Tighter limit on login to slow credential-stuffing attacks
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({
    status: 200,
    description:
      'Login successful — access and refresh tokens set as httpOnly cookies',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error — missing or malformed fields',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } = await this.authService.login(
      dto.email,
      dto.password,
    );
    this.setAuthCookies(res, access_token, refresh_token);
    return { user, access_token };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({
    summary: 'Refresh access token using the refresh_token cookie',
  })
  @ApiResponse({
    status: 200,
    description: 'New access token issued as httpOnly cookie',
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as Record<string, string | undefined>;
    const refreshToken = cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    // Rotation: old token is revoked, a fresh pair is returned
    const { access_token, refresh_token } =
      await this.authService.refreshTokens(refreshToken);
    this.setAuthCookies(res, access_token, refresh_token);
    return { message: 'Token refreshed' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log out — revokes refresh tokens and clears cookies',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as Record<string, string | undefined>;
    // Revoke all DB tokens for this user; silently ignores invalid tokens
    await this.authService.logoutUser(cookies['refresh_token']);
    res.clearCookie('access_token', COOKIE_BASE);
    res.clearCookie('refresh_token', COOKIE_BASE);
    return { message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'The authenticated user profile',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorised — missing or invalid JWT',
  })
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie('access_token', accessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
