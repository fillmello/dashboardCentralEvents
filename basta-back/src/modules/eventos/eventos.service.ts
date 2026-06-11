import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evento, EventoMomento } from 'src/common/entities/evento.entity';
import { User } from 'src/common/entities/user.entity';
import { Role } from 'src/common/enums/role.enum';
import { CreateEventoDto } from './dtos/create-evento.dto';
import { CreateMomentoDto } from './dtos/create-momento.dto';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private eventosRepository: Repository<Evento>,
    @InjectRepository(EventoMomento)
    private momentosRepository: Repository<EventoMomento>,
  ) {}

  async create(
    createEventoDto: CreateEventoDto,
    currentUser: User,
  ): Promise<Evento> {
    // Apenas Gestor pode criar eventos
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException(
        'Apenas gestores podem criar eventos',
      );
    }

    const evento = this.eventosRepository.create({
      ...createEventoDto,
      criadoPorId: currentUser.id,
    });

    return this.eventosRepository.save(evento);
  }

  async findAll(): Promise<Evento[]> {
    return this.eventosRepository.find({
      relations: ['criadoPor', 'momentos'],
      order: { dataInicio: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Evento> {
    const evento = await this.eventosRepository.findOne({
      where: { id },
      relations: ['criadoPor', 'momentos'],
    });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    return evento;
  }

  async update(
    id: string,
    updateEventoDto: any,
    currentUser: User,
  ): Promise<Evento> {
    // Apenas Gestor pode editar
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException(
        'Apenas gestores podem editar eventos',
      );
    }

    const evento = await this.findOne(id);
    Object.assign(evento, updateEventoDto);

    return this.eventosRepository.save(evento);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    // Apenas Gestor pode deletar
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException(
        'Apenas gestores podem deletar eventos',
      );
    }

    const evento = await this.findOne(id);
    await this.eventosRepository.remove(evento);
  }

  async startEvento(id: string, currentUser: User): Promise<Evento> {
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException(
        'Apenas gestores podem iniciar eventos',
      );
    }

    const evento = await this.findOne(id);

    if (evento.status !== 'planejamento') {
      throw new BadRequestException('Evento já foi iniciado');
    }

    evento.status = 'ao_vivo';
    evento.horaInicioReal = new Date();
    evento.tempoDecorridoMs = 0;

    return this.eventosRepository.save(evento);
  }

  async pauseEvento(id: string, currentUser: User): Promise<Evento> {
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException(
        'Apenas gestores podem pausar eventos',
      );
    }

    const evento = await this.findOne(id);

    if (evento.status !== 'ao_vivo') {
      throw new BadRequestException('Evento não está em andamento');
    }

    evento.horaPausaReal = new Date();

    return this.eventosRepository.save(evento);
  }

  async resumeEvento(id: string, currentUser: User): Promise<Evento> {
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException(
        'Apenas gestores podem retomar eventos',
      );
    }

    const evento = await this.findOne(id);

    if (evento.status !== 'ao_vivo') {
      throw new BadRequestException('Evento não está em pausa');
    }

    // Calcular tempo decorrido
    if (evento.horaInicioReal && evento.horaPausaReal) {
      const elapsed = evento.horaPausaReal.getTime() - evento.horaInicioReal.getTime();
      evento.tempoDecorridoMs += elapsed;
    }

    evento.horaPausaReal = null;
    evento.horaInicioReal = new Date(); // Reset para novo contador

    return this.eventosRepository.save(evento);
  }

  async endEvento(id: string, currentUser: User): Promise<Evento> {
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException(
        'Apenas gestores podem encerrar eventos',
      );
    }

    const evento = await this.findOne(id);

    if (evento.status === 'encerrado') {
      throw new BadRequestException('Evento já foi encerrado');
    }

    if (evento.horaInicioReal && !evento.horaPausaReal) {
      const elapsed = new Date().getTime() - evento.horaInicioReal.getTime();
      evento.tempoDecorridoMs += elapsed;
    }

    evento.status = 'encerrado';

    return this.eventosRepository.save(evento);
  }

  async resetEvento(id: string, currentUser: User): Promise<Evento> {
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException(
        'Apenas gestores podem resetar eventos',
      );
    }

    const evento = await this.findOne(id);

    evento.status = 'planejamento';
    evento.horaInicioReal = null;
    evento.horaPausaReal = null;
    evento.tempoDecorridoMs = 0;

    return this.eventosRepository.save(evento);
  }

  async addMomento(
    createMomentoDto: CreateMomentoDto,
    currentUser: User,
  ): Promise<EventoMomento> {
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException(
        'Apenas gestores podem adicionar momentos',
      );
    }

    const evento = await this.findOne(createMomentoDto.eventoId);

    const momento = this.momentosRepository.create(createMomentoDto);
    return this.momentosRepository.save(momento);
  }

  async updateMomento(
    id: string,
    updateMomentoDto: any,
    currentUser: User,
  ): Promise<EventoMomento> {
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException(
        'Apenas gestores podem editar momentos',
      );
    }

    const momento = await this.momentosRepository.findOne({
      where: { id },
    });

    if (!momento) {
      throw new NotFoundException('Momento não encontrado');
    }

    Object.assign(momento, updateMomentoDto);
    return this.momentosRepository.save(momento);
  }

  async completeMomento(
    id: string,
    currentUser: User,
  ): Promise<EventoMomento> {
    const momento = await this.momentosRepository.findOne({
      where: { id },
    });

    if (!momento) {
      throw new NotFoundException('Momento não encontrado');
    }

    momento.horaConclusao = new Date();
    return this.momentosRepository.save(momento);
  }

  async startMomento(
    id: string,
    currentUser: User,
  ): Promise<EventoMomento> {
    const momento = await this.momentosRepository.findOne({
      where: { id },
    });

    if (!momento) {
      throw new NotFoundException('Momento não encontrado');
    }

    momento.horaInicio = new Date();
    return this.momentosRepository.save(momento);
  }
}
