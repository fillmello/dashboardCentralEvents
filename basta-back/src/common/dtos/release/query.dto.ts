import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../shared/pagination-query.dto';

export class ReleaseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(['active', 'upcoming', 'inactive'])
  status?: 'active' | 'upcoming' | 'inactive';
}
