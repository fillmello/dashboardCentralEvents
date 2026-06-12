import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInDto } from 'src/common/dtos/auth/sign-in.dto';
import type { Response, Request } from 'express';
@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({
    short: { limit: 5, ttl: 60_000 },
    long: { limit: 20, ttl: 600_000 },
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signIn(dto);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRATION || '259200') * 1000,
    });
    return { access_token: tokens.access_token };
  }

  @Throttle({
    short: { limit: 10, ttl: 60_000 },
    long: { limit: 60, ttl: 600_000 },
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const token = req.cookies['refresh_token'];
    if (!token)
      throw new UnauthorizedException('Sessão inválida ou expirada');
    const tokens = await this.authService.refresh(token);
    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refresh_token'];
    if (!token)
      throw new UnauthorizedException('Sessão inválida ou expirada');
    await this.authService.logout(token);
    res.clearCookie('refresh_token');
    return { message: 'Desconectado' };
  }
}
