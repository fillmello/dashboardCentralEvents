import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Platform } from 'src/common/enums/platform.enum';
import { PostType } from 'src/common/enums/post-type.enum';
import { PostFormat } from 'src/common/enums/post-format.enum';
import { PostStatus } from 'src/common/enums/post-status.enum';

// Quick filters (RF-04). `responsibleId` is honored only for Gestores; other
// roles are always scoped to their own posts server-side (RF-08).
export class PostQueryDto {
  @IsOptional()
  @IsEnum(Platform)
  platform?: Platform;

  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsOptional()
  @IsEnum(PostFormat)
  format?: PostFormat;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  responsibleId?: number;
}
