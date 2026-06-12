import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { Platform } from 'src/common/enums/platform.enum';
import { PostType } from 'src/common/enums/post-type.enum';
import { PostFormat } from 'src/common/enums/post-format.enum';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  // Assigned "responsável". Optional — a post can start unassigned.
  @IsOptional()
  @IsInt()
  @IsPositive()
  responsibleId?: number;

  @IsEnum(Platform)
  platform: Platform;

  @IsEnum(PostType)
  type: PostType;

  @IsEnum(PostFormat)
  format: PostFormat;
}
