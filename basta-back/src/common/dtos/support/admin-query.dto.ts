import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dtos/shared/pagination-query.dto';
import { SupportStatus } from 'src/common/enums/support-status.enum';

export class ListSupportAdminQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SupportStatus)
  status?: SupportStatus;
}
