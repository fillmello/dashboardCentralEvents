import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../shared/pagination-query.dto';

export class CollectionQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
