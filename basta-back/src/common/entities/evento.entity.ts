import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('eventos')
export class Evento extends BaseEntity {
  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column()
  dataInicio: Date;

  @Column()
  dataFim: Date;

  @Column({
    type: 'enum',
    enum: ['planejamento', 'ao_vivo', 'encerrado'],
    default: 'planejamento',
  })
  status: 'planejamento' | 'ao_vivo' | 'encerrado';

  @Column({ type: 'timestamp', nullable: true })
  horaInicioReal: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  horaPausaReal: Date | null;

  @Column({ type: 'int', default: 0 })
  tempoDecorridoMs: number; // Tempo decorrido em milissegundos

  @Column({ type: 'uuid' })
  criadoPorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'criadoPorId' })
  criadoPor: User;

  @OneToMany(() => EventoMomento, (momento) => momento.evento, {
    cascade: true,
  })
  momentos: EventoMomento[];
}

@Entity('evento_momentos')
export class EventoMomento extends BaseEntity {
  @Column()
  descricao: string;

  @Column()
  horaAgendada: Date;

  @Column({ type: 'timestamp', nullable: true })
  horaInicio: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  horaConclusao: Date | null;

  @Column({ type: 'int' })
  ordem: number;

  @Column({ type: 'uuid' })
  eventoId: string;

  @ManyToOne(() => Evento, (evento) => evento.momentos)
  @JoinColumn({ name: 'eventoId' })
  evento: Evento;
}
