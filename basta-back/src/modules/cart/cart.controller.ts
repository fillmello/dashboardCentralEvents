import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from 'src/common/dtos/cart/add-item.dto';
import { UpdateCartItemDto } from 'src/common/dtos/cart/update-item.dto';
import type { AuthenticatedRequest } from 'src/auth/jwt-payload.type';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';

@Roles(Role.USER)
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Request() req: AuthenticatedRequest) {
    return this.cartService.getCart(req.user.sub);
  }

  @Post('items')
  addItem(@Request() req: AuthenticatedRequest, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(req.user.sub, dto);
  }

  @Put('items/:itemId')
  updateItem(
    @Request() req: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.sub, itemId, dto);
  }

  @Delete('items/:itemId')
  removeItem(
    @Request() req: AuthenticatedRequest,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.cartService.removeItem(req.user.sub, itemId);
  }

  @Post('sync')
  syncCart(
    @Request() req: AuthenticatedRequest,
    @Body() body: { items: AddCartItemDto[] },
  ) {
    return this.cartService.syncCart(req.user.sub, body.items);
  }
}
