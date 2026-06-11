import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from 'src/common/entities/cart.entity';
import { CartItem } from 'src/common/entities/cart-item.entity';
import { ProductRelease } from 'src/common/entities/product-release.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, ProductRelease])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
