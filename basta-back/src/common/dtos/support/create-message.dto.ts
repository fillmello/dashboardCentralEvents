import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSupportMessageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text?: string;
}
