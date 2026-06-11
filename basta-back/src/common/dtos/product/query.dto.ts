import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Gender } from 'src/common/enums/product.enums';
import { PaginationQueryDto } from '../shared/pagination-query.dto';

export class ProductQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
