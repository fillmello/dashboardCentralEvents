import {
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { PostType, PostFormat, Platform } from 'src/common/enums/post.enum';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Platform)
  @IsOptional()
  platform?: Platform;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsEnum(PostFormat)
  @IsOptional()
  format?: PostFormat;
}
