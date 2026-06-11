import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { OrdersService } from '../orders/orders.service';

@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }
}
