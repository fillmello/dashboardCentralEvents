import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Gender, Size } from 'src/common/enums/product.enums';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(Size, { each: true })
  size: Size[];

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(50, { each: true })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    each: true,
    message: 'Cada cor deve ser um hexadecimal de 6 dígitos (ex.: #FFFFFF)',
  })
  colors: string[];
}
