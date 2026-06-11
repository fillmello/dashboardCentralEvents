import { IsInt, IsPositive } from 'class-validator';

export class CreatePixDto {
  @IsInt()
  @IsPositive()
  orderId: number;
}
