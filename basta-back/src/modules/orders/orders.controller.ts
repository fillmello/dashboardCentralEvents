import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Request,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateOrderDto } from 'src/common/dtos/order/create.dto';
import { UpdateOrderStatusDto } from 'src/common/dtos/order/update-status.dto';
import {
  OrderQueryDto,
  OrderMineQueryDto,
} from 'src/common/dtos/order/query.dto';
import type { AuthenticatedRequest } from 'src/auth/jwt-payload.type';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Roles(Role.USER)
  @Get('me')
  getMine(
    @Request() req: AuthenticatedRequest,
    @Query() query: OrderMineQueryDto,
  ) {
    return this.ordersService.findMine(req.user.sub, query);
  }

  @Roles(Role.USER, Role.ADMIN)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.ordersService.findOne(id, req.user.sub, req.user.role);
  }

  @Roles(Role.ADMIN)
  @Put(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Roles(Role.USER)
  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateOrderDto) {
    return this.ordersService.createFromCart(req.user.sub, dto);
  }
}
