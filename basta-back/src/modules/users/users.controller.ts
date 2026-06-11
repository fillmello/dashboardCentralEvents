import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateUserDto } from 'src/common/dtos/user/register.dto';
import { UpdateUserDto } from 'src/common/dtos/user/update.dto';
import type { AuthenticatedRequest } from 'src/auth/jwt-payload.type';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @Post('')
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @Roles(Role.USER)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Roles(Role.USER)
  @Put()
  update(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }

  @Roles(Role.USER)
  @Delete()
  remove(@Request() req: AuthenticatedRequest) {
    return this.usersService.remove(req.user.sub);
  }
}
