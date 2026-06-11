import { IsString, IsDate, IsInt, IsUUID } from 'class-validator';

export class CreateMomentoDto {
  @IsString()
  descricao: string;

  @IsDate()
  horaAgendada: Date;

  @IsInt()
  ordem: number;

  @IsUUID()
  eventoId: string;
}
