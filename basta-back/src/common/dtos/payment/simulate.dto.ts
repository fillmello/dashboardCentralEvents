import { IsInt, IsPositive } from 'class-validator';

export class SimulateDto {
  @IsInt()
  @IsPositive()
  orderId: number;
}
