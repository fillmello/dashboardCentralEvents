import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateScheduleItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @Type(() => Date)
  @IsDate()
  plannedTime: Date;
}
