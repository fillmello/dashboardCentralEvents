import { IsString, IsDate, IsOptional } from 'class-validator';

export class CreateEventoDto {
  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsDate()
  dataInicio: Date;

  @IsDate()
  dataFim: Date;
}
