import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Size, Gender } from 'src/common/enums/product.enums';

export class AddCartItemDto {
  @IsInt()
  @IsPositive()
  productReleaseId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(Size)
  size: Size;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  color: string;
}
