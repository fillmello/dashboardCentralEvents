import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from 'src/common/dtos/auth/sign-in.dto';
import { User } from 'src/common/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async generateTokens(
    user: User,
  ): Promise<{ refresh_token: string; access_token: string }> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      { expiresIn: parseInt(process.env.JWT_EXPIRATION || '3600') },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      { expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION || '259200') },
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      refresh_token: refreshToken,
      access_token: accessToken,
    };
  }

  async signIn(dto: SignInDto) {
    const user = await this.usersService.findOne(dto.email);
    if (user == null)
      throw new UnauthorizedException('Nome do usuário ou senha incorreto');
    if (!(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException('Nome do usuário ou senha incorreto');
    return this.generateTokens(user);
  }

  async refresh(token: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOneById(payload.sub);
      if (!user || !user.refreshToken)
        throw new UnauthorizedException('Sessão inválida ou expirada');
      const tokenMatches = await bcrypt.compare(token, user.refreshToken);
      if (!tokenMatches)
        throw new UnauthorizedException('Sessão inválida ou expirada');
      const accessToken = await this.jwtService.signAsync(
        { sub: user.id, role: user.role },
        { expiresIn: parseInt(process.env.JWT_EXPIRATION || '3600') },
      );
      return { access_token: accessToken };
    } catch {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOneById(payload.sub);
      if (user) await this.usersService.updateRefreshToken(user.id, null);
    } catch {
      // token invalid or expired — still clear the cookie on the controller side
    }
  }
}
