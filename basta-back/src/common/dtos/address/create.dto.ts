import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{8}$/, { message: 'CEP deve conter 8 dígitos' })
  cep: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  street: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  state: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  number: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  complement?: string;
}
