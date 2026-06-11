import {
  IsString,
  IsEnum,
  IsUUID,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { PostType, PostFormat, Platform } from 'src/common/enums/post.enum';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Platform)
  platform: Platform;

  @IsEnum(PostType)
  type: PostType;

  @IsEnum(PostFormat)
  format: PostFormat;

  @IsUUID()
  responsibleId: string;

  @IsUUID()
  @IsOptional()
  eventoId?: string;
}
