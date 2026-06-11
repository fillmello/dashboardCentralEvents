import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PostStatus } from 'src/common/enums/post.enum';

export class AdvanceStatusDto {
  @IsEnum(PostStatus)
  newStatus: PostStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
