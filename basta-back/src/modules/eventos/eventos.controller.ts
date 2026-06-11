import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EventosService } from './eventos.service';
import { CreateEventoDto } from './dtos/create-evento.dto';
import { CreateMomentoDto } from './dtos/create-momento.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthenticatedRequest } from 'src/auth/jwt-payload.type';

@Controller('eventos')
@UseGuards(JwtAuthGuard)
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Post()
  @Roles(Role.GESTOR)
  create(
    @Body() createEventoDto: CreateEventoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.create(createEventoDto, req.user);
  }

  @Get()
  findAll() {
    return this.eventosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.GESTOR)
  update(
    @Param('id') id: string,
    @Body() updateEventoDto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.update(id, updateEventoDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.GESTOR)
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.remove(id, req.user);
  }

  @Patch(':id/start')
  @Roles(Role.GESTOR)
  start(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.startEvento(id, req.user);
  }

  @Patch(':id/pause')
  @Roles(Role.GESTOR)
  pause(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.pauseEvento(id, req.user);
  }

  @Patch(':id/resume')
  @Roles(Role.GESTOR)
  resume(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.resumeEvento(id, req.user);
  }

  @Patch(':id/end')
  @Roles(Role.GESTOR)
  end(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.endEvento(id, req.user);
  }

  @Patch(':id/reset')
  @Roles(Role.GESTOR)
  reset(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.resetEvento(id, req.user);
  }

  @Post('momentos')
  @Roles(Role.GESTOR)
  addMomento(
    @Body() createMomentoDto: CreateMomentoDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.addMomento(createMomentoDto, req.user);
  }

  @Patch('momentos/:id')
  @Roles(Role.GESTOR)
  updateMomento(
    @Param('id') id: string,
    @Body() updateMomentoDto: any,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.updateMomento(
      id,
      updateMomentoDto,
      req.user,
    );
  }

  @Patch('momentos/:id/start')
  startMomento(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.startMomento(id, req.user);
  }

  @Patch('momentos/:id/complete')
  completeMomento(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventosService.completeMomento(id, req.user);
  }
}
