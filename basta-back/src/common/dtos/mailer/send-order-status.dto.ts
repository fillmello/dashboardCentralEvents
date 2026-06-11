import { IsEnum, IsInt, Min } from 'class-validator';
import { OrderStatus } from 'src/common/enums/order-status.enum';

export class SendOrderStatusDto {
  @IsInt()
  @Min(1)
  orderId: number;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
