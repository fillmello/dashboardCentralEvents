import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosService } from './eventos.service';
import { EventosController } from './eventos.controller';
import { Evento, EventoMomento } from 'src/common/entities/evento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, EventoMomento])],
  controllers: [EventosController],
  providers: [EventosService],
  exports: [EventosService],
})
export class EventosModule {}
