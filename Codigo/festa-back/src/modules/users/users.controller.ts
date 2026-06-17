import {
  Body,
  Controller,
  Post,
  Put,
  Patch,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateUserDto } from 'src/common/dtos/user/register.dto';
import { ManagedCreateUserDto } from 'src/common/dtos/user/managed-create.dto';
import { UpdateUserDto } from 'src/common/dtos/user/update.dto';
import { UpdateRoleDto } from 'src/common/dtos/user/update-role.dto';
import { ResetPasswordDto } from 'src/common/dtos/user/reset-password.dto';
import type { AuthenticatedRequest } from 'src/auth/jwt-payload.type';
import { Role } from 'src/common/enums/role.enum';

const ALL_ROLES = [
  Role.GESTAO,
  Role.HEAD,
  Role.PAINEL,
  Role.INDIVIDUAL,
] as const;

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Self-registration → INDIVIDUAL (sees only its own tasks).
  @Public()
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // Gestão creates an account with an explicit role (Gestão or Painel).
  @Roles(Role.GESTAO)
  @Post('managed')
  createManaged(@Body() dto: ManagedCreateUserDto) {
    return this.usersService.createManaged(dto);
  }

  @Roles(...ALL_ROLES)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Roles(...ALL_ROLES)
  @Put()
  update(@Request() req: AuthenticatedRequest, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.sub, dto);
  }

  @Roles(...ALL_ROLES)
  @Delete()
  deleteOwn(@Request() req: AuthenticatedRequest) {
    return this.usersService.delete(req.user.sub);
  }

  // --- Account management ---

  // Roster: Coordenação, Head + Painel (all need names for the responsável
  // picker/filter on the board). Account management below stays Coordenação-only.
  @Roles(Role.GESTAO, Role.HEAD, Role.PAINEL)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles(Role.GESTAO)
  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(id, dto.role);
  }

  @Roles(Role.GESTAO)
  @Patch(':id/password')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.usersService.resetPassword(id, dto.password);
  }

  @Roles(Role.GESTAO)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}
