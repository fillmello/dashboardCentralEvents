import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from 'src/common/entities/collection.entity';
import { CollectionsController } from './collections.controller';
import { ProductsService } from '../products/products.service';
import { Product } from 'src/common/entities/product.entity';
import { ProductRelease } from 'src/common/entities/product-release.entity';
import { Release } from 'src/common/entities/release.entity';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collection, Product, ProductRelease, Release]),
    StorageModule,
  ],
  providers: [CollectionsService, ProductsService],
  controllers: [CollectionsController],
  exports: [CollectionsService],
})
export class CollectionsModule {}
